from flask import Flask, redirect, render_template, send_file, url_for
from datetime import datetime

# Define the app using Flask
app = Flask(__name__)

data = {}


@app.route('/')
def index():
    return render_template('index.html', data=data)


@app.route('/my-cabinet')
def about():

    data = {'tab_name': 'My Cabinet'}

    return render_template('my-cabinet.html', data=data)


if __name__ == '__main__':
    app.run(debug=True)
