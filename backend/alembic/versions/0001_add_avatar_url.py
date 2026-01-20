"""add avatar_url to preacher

Revision ID: 0001_add_avatar_url
Revises: 
Create Date: 2026-01-18 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001_add_avatar_url'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Add avatar_url column if it doesn't exist
    try:
        op.add_column('preacher', sa.Column('avatar_url', sa.String(), nullable=True))
    except Exception:
        # best-effort: if column exists, ignore
        pass


def downgrade():
    try:
        op.drop_column('preacher', 'avatar_url')
    except Exception:
        pass
