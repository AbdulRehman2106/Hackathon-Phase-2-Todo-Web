"""add_category_and_due_date_to_tasks

Revision ID: a6878af5b66f
Revises: 001
Create Date: 2026-02-05 14:23:11.577860

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a6878af5b66f'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add category column
    op.add_column('tasks', sa.Column('category', sa.String(length=50), nullable=True))

    # Add due_date column
    op.add_column('tasks', sa.Column('due_date', sa.DateTime(), nullable=True))


def downgrade() -> None:
    # Remove columns in reverse order
    op.drop_column('tasks', 'due_date')
    op.drop_column('tasks', 'category')
