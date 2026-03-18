from pathlib import Path
import os

ROOT = Path(__file__).resolve().parents[1]


def test_compose_exists_and_has_services():
    compose = ROOT / "docker-compose.yml"
    assert compose.exists(), "docker-compose.yml must exist"
    content = compose.read_text()
    assert "app:" in content
    assert "db:" in content


def test_env_example_documents_required_keys():
    env_example = ROOT / ".env.example"
    assert env_example.exists(), ".env.example must exist"
    content = env_example.read_text()
    for key in [
        "APP_PORT",
        "DATABASE_URL",
        "POSTGRES_DB",
        "POSTGRES_USER",
        "POSTGRES_PASSWORD",
        "ADMIN_EMAIL",
        "ADMIN_PASSWORD",
        "BACKUP_DIR",
    ]:
        assert f"{key}=" in content


def test_health_endpoints_return_200():
    from app.main import app

    client = app.test_client()
    assert client.get("/health/liveness").status_code == 200
    assert client.get("/health/readiness").status_code == 200


def test_setup_and_backup_restore_scripts_exist_and_executable():
    for script in ["setup.sh", "backup.sh", "restore.sh"]:
        p = ROOT / "scripts" / script
        assert p.exists(), f"{script} must exist"
        assert os.access(p, os.X_OK), f"{script} must be executable"
