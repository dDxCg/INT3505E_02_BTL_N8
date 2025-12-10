"""trigger fetch ingre-hist

Revision ID: d41b4524cac4
Revises: 5ce5db6b9b73
Create Date: 2025-12-10 21:29:10.649839

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd41b4524cac4'
down_revision: Union[str, Sequence[str], None] = '5ce5db6b9b73'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    # Create function
    op.execute("""
    CREATE OR REPLACE FUNCTION log_ingredient_quantity_change()
    RETURNS TRIGGER AS $$
    BEGIN
        IF NEW.quantity IS DISTINCT FROM OLD.quantity THEN
            INSERT INTO ingredient_histories (
                ingredient_id,
                old_quantity,
                new_quantity,
                quantity_change,
                created_at
            )
            VALUES (
                OLD.id,
                OLD.quantity,
                NEW.quantity,
                NEW.quantity - OLD.quantity,
                NOW()
            );
        END IF;

        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    """)

    # Create trigger
    op.execute("""
    CREATE TRIGGER trg_ingredient_history
    AFTER UPDATE ON ingredients
    FOR EACH ROW
    EXECUTE FUNCTION log_ingredient_quantity_change();
    """)


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("""
    DROP TRIGGER IF EXISTS trg_ingredient_history ON ingredients;
    DROP FUNCTION IF EXISTS log_ingredient_quantity_change();
    """)
