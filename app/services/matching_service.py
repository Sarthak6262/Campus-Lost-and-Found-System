"""
Smart Matching Service — rule-based algorithm to find potential item matches.

Scoring breakdown (max 100 points):
  - Category match:   30 points
  - Item name similarity: 40 points (using word overlap)
  - Color match:      15 points
  - Location match:   15 points

Only matches scoring >= 40 points (40%) are returned.
"""
import logging
from typing import List

from sqlalchemy.orm import Session

from app.models.item import Item, ItemType
from app.repositories.item_repository import ItemRepository
from app.schemas.item import ItemMatchResponse, MatchResult

logger = logging.getLogger(__name__)

MATCH_THRESHOLD = 40  # Minimum score to include in results


def _word_overlap_score(text_a: str, text_b: str) -> float:
    """
    Calculate word-overlap similarity between two strings.
    Returns a float between 0.0 and 1.0.
    """
    words_a = set(text_a.lower().split())
    words_b = set(text_b.lower().split())
    if not words_a or not words_b:
        return 0.0
    intersection = words_a & words_b
    union = words_a | words_b
    return len(intersection) / len(union)


def _score_match(source: Item, candidate: Item) -> tuple[int, List[str]]:
    """
    Score how well a candidate item matches the source item.

    Returns:
        (score, reasons) where score is 0-100 and reasons is a list of strings.
    """
    score = 0
    reasons: List[str] = []

    # Category match: 30 points
    if source.category == candidate.category:
        score += 30
        reasons.append("Same category")

    # Item name similarity: 40 points
    name_similarity = _word_overlap_score(source.item_name, candidate.item_name)
    name_points = int(name_similarity * 40)
    if name_points > 0:
        score += name_points
        if name_points >= 30:
            reasons.append("Similar item name")
        elif name_points >= 15:
            reasons.append("Partially matching item name")

    # Color match: 15 points
    if source.color and candidate.color:
        if source.color.lower() == candidate.color.lower():
            score += 15
            reasons.append("Same color")
        elif source.color.lower() in candidate.color.lower() or \
                candidate.color.lower() in source.color.lower():
            score += 7
            reasons.append("Similar color")

    # Location match: 15 points
    if source.location and candidate.location:
        src_loc = source.location.lower()
        cand_loc = candidate.location.lower()
        if src_loc == cand_loc:
            score += 15
            reasons.append("Same location")
        else:
            loc_similarity = _word_overlap_score(src_loc, cand_loc)
            loc_points = int(loc_similarity * 15)
            if loc_points >= 5:
                score += loc_points
                reasons.append("Similar location")

    return min(score, 100), reasons


class MatchingService:
    """Rule-based item matching service."""

    def __init__(self, db: Session) -> None:
        self.item_repo = ItemRepository(db)

    def find_matches(self, item: Item) -> ItemMatchResponse:
        """
        Find matching items for the given item.
        - For LOST items: searches FOUND items.
        - For FOUND items: searches LOST items.
        Returns matches scored above MATCH_THRESHOLD.
        """
        candidates = self.item_repo.get_opposite_type_active(item.type)

        results: List[MatchResult] = []
        for candidate in candidates:
            if candidate.id == item.id:
                continue

            score, reasons = _score_match(item, candidate)

            if score >= MATCH_THRESHOLD:
                results.append(
                    MatchResult(
                        matched_item_id=candidate.id,
                        matched_item_name=candidate.item_name,
                        match_score=score,
                        reasons=reasons,
                    )
                )

        # Sort by score descending
        results.sort(key=lambda r: r.match_score, reverse=True)

        logger.info(
            "Matching complete for item_id=%d: %d matches found",
            item.id, len(results)
        )
        return ItemMatchResponse(item_id=item.id, matches=results)
