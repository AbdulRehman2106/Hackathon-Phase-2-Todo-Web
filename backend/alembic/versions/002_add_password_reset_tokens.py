"""Add password reset tokens table

Revision ID: 002
Revises: a6878af5b66f
Create Date: 2026-02-07

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002'
down_revision = 'a6878af5b66f'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create password_reset_tokens table
    op.create_table(
        'password_reset_tokens',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('token', sa.String(length=255), nullable=False),
        sa.Column('expires_at', sa.DateTime(), nullable=False),
        sa.Column('used', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE')
    )
    op.create_index('idx_password_reset_tokens_user_id', 'password_reset_tokens', ['user_id'], unique=False)
    op.create_index('idx_password_reset_tokens_token', 'password_reset_tokens', ['token'], unique=True)
    op.create_index('idx_password_reset_tokens_expires_at', 'password_reset_tokens', ['expires_at'], unique=False)


def downgrade() -> None:
    op.drop_index('idx_password_reset_tokens_expires_at', table_name='password_reset_tokens')
    op.drop_index('idx_password_reset_tokens_token', table_name='password_reset_tokens')
    op.drop_index('idx_password_reset_tokens_user_id', table_name='password_reset_tokens')
    op.drop_table('password_reset_tokens')
