from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Integer, DateTime, Float, ForeignKey, UniqueConstraint
from datetime import datetime, timezone

class Base(DeclarativeBase):
    pass

class Series(Base):
    __tablename__ = "series"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    source: Mapped[str] = mapped_column(String(50), nullable=False)
    cache_key: Mapped[str] = mapped_column(String(300), nullable=False, unique=True)
    title: Mapped[str | None] = mapped_column(String(200))
    ttl_hours: Mapped[int] = mapped_column(Integer, default=24)
    last_fetched_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at : Mapped[datetime] = mapped_column(DateTime(timezone=True), default= lambda: datetime.now(timezone.utc))

class DataPoint(Base):
    __tablename__ = "data_points"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    series_id : Mapped[int] = mapped_column(ForeignKey("series.id"), nullable=False)
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False)

    __table_args__ = (
        UniqueConstraint("series_id", "date", name="uq_series_date"),
    )