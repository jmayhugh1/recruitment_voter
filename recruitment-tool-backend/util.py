import os
from typing import Dict, List, Optional

import boto3
from botocore.exceptions import NoCredentialsError
from dotenv import load_dotenv


class Candidate:
    def __init__(
        self,
        uin: int,
        name: str,
        email: str,
        image_url: str = "default",
        major: str = "General Engineering",
    ) -> None:
        self.uin: int = uin
        self.name: str = name
        self.major: str = major
        self.email: str = email
        self.image_url: str = image_url

    def to_dict(self) -> Dict[str, str | int]:
        return {
            "uin": self.uin,
            "name": self.name,
            "major": self.major,
            "email": self.email,
            "image_url": self.image_url,
        }


class CandidateInfo:
    def __init__(self) -> None:
        load_dotenv()

        # Load credentials and config
        self.AWS_ACCESS_KEY_ID: Optional[str] = os.getenv("AWS_ACCESS_KEY_ID")
        self.AWS_SECRET_ACCESS_KEY: Optional[str] = os.getenv("AWS_SECRET_ACCESS_KEY")
        self.AWS_DEFAULT_REGION: Optional[str] = os.getenv("AWS_DEFAULT_REGION")
        self.AWS_S3_BUCKET_NAME: Optional[str] = os.getenv("AWS_S3_BUCKET_NAME")
        self.AWS_DYNAMODB_TABLE: Optional[str] = os.getenv("AWS_DYNAMODB_TABLE")

        self.s3 = boto3.client(
            "s3",
            aws_access_key_id=self.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=self.AWS_SECRET_ACCESS_KEY,
            region_name=self.AWS_DEFAULT_REGION,
        )

        self.dynamodb = boto3.resource(
            "dynamodb",
            aws_access_key_id=self.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=self.AWS_SECRET_ACCESS_KEY,
            region_name=self.AWS_DEFAULT_REGION,
        )

        # table
        if not self.AWS_DYNAMODB_TABLE:
            raise ValueError("AWS_DYNAMODB_TABLE environment variable not set")

        self.table = self.dynamodb.Table(self.AWS_DYNAMODB_TABLE)

    def get_s3_image_name(self, uin: int) -> str:
        return f"{uin}.jpg"

    def get_presigned_url(self, uin: int, expires_in: int = 3600) -> Optional[str]:
        try:
            if not self.AWS_S3_BUCKET_NAME:
                raise ValueError("AWS_S3_BUCKET_NAME environment variable not set")

            url: str = self.s3.generate_presigned_url(
                "get_object",
                Params={
                    "Bucket": self.AWS_S3_BUCKET_NAME,
                    "Key": self.get_s3_image_name(uin),
                },
                ExpiresIn=expires_in,
            )
            return url
        except NoCredentialsError:
            print("AWS credentials not available")
            return None

    def upload_candidate_image(self, uin: int, image_path: str) -> Dict[str, str]:
        if not self.AWS_S3_BUCKET_NAME:
            raise ValueError("AWS_S3_BUCKET_NAME environment variable not set")

        image_name: str = f"{uin}.jpg"
        self.s3.upload_file(image_path, self.AWS_S3_BUCKET_NAME, image_name)

        return {
            "message": "Image uploaded successfully",
            "image_url": f"s3://{self.AWS_S3_BUCKET_NAME}/{image_name}",
        }

    def create_candidate(self, candidate: Candidate) -> Dict[str, str | int]:
        # Upload candidate info to DynamoDB
        self.table.put_item(Item=candidate.to_dict())

        # Upload candidate image to S3 if provided
        if candidate.image_url and candidate.image_url != "default":
            image_name: str = self.get_s3_image_name(candidate.uin)
            self.s3.upload_file(
                candidate.image_url, self.AWS_S3_BUCKET_NAME, image_name
            )

        return candidate.to_dict()

    def get_all_candidates(self) -> List[Candidate]:
        # Scan DynamoDB table to get all candidates
        response: Dict[str, List[Dict[str, str | int]]] = self.table.scan()
        candidates: List[Dict[str, str | int]] = response.get("Items", [])

        return [Candidate(**item) for item in candidates]
