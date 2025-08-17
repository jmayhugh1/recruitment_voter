import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import tempfile
from typing import Generator, List

import boto3
import pytest
from moto import mock_aws
from util import Candidate, CandidateInfo  # adjust the import path


@pytest.fixture(scope="function")
def aws_env(tmp_path) -> Generator[None, None, None]:
    """
    Setup AWS environment variables for testing.
    """
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_DEFAULT_REGION"] = "us-east-1"
    os.environ["AWS_S3_BUCKET_NAME"] = "test-bucket"
    os.environ["AWS_DYNAMODB_TABLE"] = "candidates"

    yield

    # cleanup
    for var in [
        "AWS_ACCESS_KEY_ID",
        "AWS_SECRET_ACCESS_KEY",
        "AWS_DEFAULT_REGION",
        "AWS_S3_BUCKET_NAME",
        "AWS_DYNAMODB_TABLE",
    ]:
        os.environ.pop(var, None)


@pytest.fixture(scope="function")
def mocked_aws(aws_env) -> Generator[CandidateInfo, None, None]:
    """
    Create mocked AWS services with moto and initialize CandidateInfo.
    """
    with mock_aws():
        region = "us-east-1"
        bucket_name = os.environ["AWS_S3_BUCKET_NAME"]

        # Setup mocked S3
        s3 = boto3.client("s3", region_name=region)
        if region == "us-east-1":
            s3.create_bucket(Bucket=bucket_name)
        else:
            s3.create_bucket(
                Bucket=bucket_name,
                CreateBucketConfiguration={"LocationConstraint": region},
            )

        # Setup mocked DynamoDB
        dynamodb = boto3.client("dynamodb", region_name=region)
        dynamodb.create_table(
            TableName=os.environ["AWS_DYNAMODB_TABLE"],
            KeySchema=[{"AttributeName": "uin", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "uin", "AttributeType": "N"}],
            BillingMode="PAY_PER_REQUEST",
        )

        yield CandidateInfo()


def test_candidate_to_dict() -> None:
    candidate = Candidate(123, "Alice", "alice@example.com", "image.jpg")
    result = candidate.to_dict()

    assert result["uin"] == 123
    assert result["name"] == "Alice"
    assert result["email"] == "alice@example.com"
    assert result["image_url"] == "image.jpg"


def test_upload_candidate_image(mocked_aws: CandidateInfo) -> None:
    candidate_info = mocked_aws

    # Create temp file
    with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
        tmp_file.write(b"test image")
        tmp_file_path = tmp_file.name

    result = candidate_info.upload_candidate_image(1, tmp_file_path)

    assert result["message"] == "Image uploaded successfully"
    assert "s3://test-bucket/1.jpg" in result["image_url"]

    # Check object exists in S3
    s3 = boto3.client("s3", region_name="us-east-1")
    resp = s3.get_object(Bucket="test-bucket", Key="1.jpg")
    assert resp["Body"].read() == b"test image"


def test_create_and_get_candidates(mocked_aws: CandidateInfo) -> None:
    candidate_info = mocked_aws
    candidate = Candidate(1, "Bob", "bob@example.com")

    candidate_info.create_candidate(candidate)
    all_candidates: List[Candidate] = candidate_info.get_all_candidates()

    assert len(all_candidates) == 1
    assert all_candidates[0].uin == 1
    assert all_candidates[0].name == "Bob"
    assert all_candidates[0].email == "bob@example.com"


def test_get_presigned_url(mocked_aws: CandidateInfo) -> None:
    candidate_info = mocked_aws
    url: str | None = candidate_info.get_presigned_url(1)

    assert url is not None
    assert "https://test-bucket.s3.amazonaws.com/1.jpg" in url
