from flask import Flask, jsonify, request
from flask_cors import CORS
import motionCapture
import base64

app = Flask(__name__)
CORS(app)


@app.route('/server', methods=['POST'])
def server():
    data = request.get_json()
    imageData = data.get('image')
    # Decode base64 data to bytes
    # print(f'imageData: {imageData}')
    try:
        image_bytes = base64.b64decode(imageData)
    except Exception as e:
        print(f"Error decoding base64 data: {e}")

    # save the bytes to a file
    try:
        with open('reference/result.png', 'wb') as f:
            f.write(image_bytes)
    except Exception as e:
        print(f"Error saving image: {e}")

    result = motionCapture.capture_motion('reference/result.png')
    return jsonify(result)


if __name__ == '__main__':
    app.run(debug=True)
