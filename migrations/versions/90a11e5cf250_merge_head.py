"""merge head

Revision ID: 90a11e5cf250
Revises: b09302d2a204, e9755a743941
Create Date: 2025-11-16 17:21:50.775074

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '90a11e5cf250'
down_revision: Union[str, Sequence[str], None] = ('b09302d2a204', 'e9755a743941')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
