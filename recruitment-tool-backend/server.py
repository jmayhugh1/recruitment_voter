import os

import boto3
from dotenv import load_dotenv
from flask import Flask, jsonify

# load the enviornment from .env
load_dotenv()

AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_DEFAULT_REGION = os.getenv("AWS_DEFAULT_REGION")


s3 = boto3.client("s3")
app = Flask(__name__)


@app.route("/")
def home():
    return jsonify({"message": "Welcome to the Recruitment Tool Backend!"})


@app.route("/api/example", methods=["GET"])
def example_endpoint():
    return jsonify({"message": "This is an example endpoint."})


if __name__ == "__main__":
    app.run(debug=True)
