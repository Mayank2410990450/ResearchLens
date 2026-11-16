import os
import hashlib
import aiofiles
from pathlib import Path
from typing import Tuple, Optional
import httpx
from app.core.config import settings
from app.core.logging import logger
from app.core.exceptions import ResearchLensException

class StorageService:
    def __init__(self):
        self.local_dir = Path(settings.LOCAL_STORAGE_DIR)
        self.local_dir.mkdir(parents=True, exist_ok=True)

    def save_file(self, file_content: bytes, file_name: str, project_id: str) -> Tuple[str, str, int]:
        """
        Validates, computes sha256 hash, and saves file to storage.
        Returns: (storage_path, file_hash, file_size_bytes)
        """
        # Validate size
        size = len(file_content)
        if size > settings.MAX_UPLOAD_SIZE_BYTES:
            raise ResearchLensException(
                f"File size exceeds maximum allowed limit of {settings.MAX_UPLOAD_SIZE_BYTES / (1024 * 1024):.0f}MB",
                status_code=400
            )

        # Validate PDF header (Magic bytes: %PDF-)
        if not file_content.startswith(b"%PDF-"):
            raise ResearchLensException("Uploaded file is not a valid scientific PDF document.", status_code=400)

        # Compute SHA-256
        sha256 = hashlib.sha256(file_content).hexdigest()

        # If Supabase Storage is configured, upload to Supabase bucket
        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            try:
                storage_path = f"{project_id}/{sha256}_{file_name}"
                upload_url = f"{settings.SUPABASE_URL}/storage/v1/object/{settings.SUPABASE_STORAGE_BUCKET}/{storage_path}"
                headers = {
                    "Authorization": f"Bearer {settings.SUPABASE_KEY}",
                    "Content-Type": "application/pdf",
                    "x-upsert": "true"
                }
                with httpx.Client(timeout=10.0) as client:
                    resp = client.post(upload_url, headers=headers, content=file_content)
                    if resp.status_code in (200, 201):
                        logger.info(f"Successfully uploaded {file_name} to Supabase Storage: {storage_path}")
                        return (storage_path, sha256, size)
                    else:
                        logger.warning(f"Supabase storage upload failed ({resp.status_code}), falling back to local: {resp.text}")
            except Exception as e:
                logger.warning(f"Supabase storage upload exception, falling back to local: {e}")

        # Local storage fallback
        project_storage = self.local_dir / project_id
        project_storage.mkdir(parents=True, exist_ok=True)
        safe_filename = f"{sha256[:16]}_{file_name}"
        dest_path = project_storage / safe_filename

        with open(dest_path, "wb") as f:
            f.write(file_content)

        logger.info(f"Saved file {file_name} to local storage: {dest_path}")
        return (str(dest_path), sha256, size)

    async def get_file_bytes(self, storage_path: str) -> bytes:
        """
        Retrieves file bytes from storage path.
        """
        path = Path(storage_path)
        if path.exists():
            async with aiofiles.open(path, "rb") as f:
                return await f.read()
        
        # If Supabase path
        if settings.SUPABASE_URL and settings.SUPABASE_KEY:
            url = f"{settings.SUPABASE_URL}/storage/v1/object/public/{settings.SUPABASE_STORAGE_BUCKET}/{storage_path}"
            headers = {"Authorization": f"Bearer {settings.SUPABASE_KEY}"}
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.get(url, headers=headers)
                if resp.status_code == 200:
                    return resp.content

        raise ResearchLensException("Document file not found in storage.", status_code=404)

storage_service = StorageService()
