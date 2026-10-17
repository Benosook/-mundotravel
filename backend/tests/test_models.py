from sqlalchemy import Numeric
from sqlalchemy.orm import configure_mappers

from app.database.base import Base
import app.models  # noqa: F401 - registers model metadata


def test_all_expected_tables_are_registered() -> None:
    configure_mappers()

    assert set(Base.metadata.tables) == {
        "branches",
        "clients",
        "flight_services",
        "hotel_services",
        "passengers",
        "payment_schedules",
        "payments",
        "quotes",
        "tour_services",
        "transport_services",
        "users",
    }


def test_money_columns_use_fixed_precision() -> None:
    money_columns = {
        "quotes": ("public_price", "net_price", "total_paid", "remaining_balance"),
        "hotel_services": ("net_price", "public_price"),
        "flight_services": ("net_price", "public_price"),
        "tour_services": ("net_price", "public_price"),
        "transport_services": ("net_price", "public_price"),
        "payments": ("amount",),
        "payment_schedules": ("amount",),
    }

    for table_name, column_names in money_columns.items():
        table = Base.metadata.tables[table_name]
        for column_name in column_names:
            column_type = table.c[column_name].type
            assert isinstance(column_type, Numeric)
            assert column_type.precision == 12
            assert column_type.scale == 2
