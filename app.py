import time
from flask import Flask, Response, redirect, render_template, request, send_file, url_for
from datetime import datetime
import g4f

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

@app.route('/medicineList')
def medicine_list():
    # You can provide data specific to the medicine list page if needed
    data = {'tab_name': 'Medicine List'}
    return render_template('medicineList.html', data=data)

@app.route('/medicineDetails')
def medicine_details():
    # You can provide data specific to the medicine list page if needed
    data = {'tab_name': 'Medicine Details'}
    return render_template('medicineDetails.html', data=data)

messages = [{"role": "system", "content": "I want you to act like a medical chatbot named Medi-bot. The chatbot will ask questions about the illness which a user may be having and will then inform the user on whether they need antibiotics or not. The chatbot will also ask follow up questions to narrow down the solution, such as age and severity of issue."}]

def generate_text_stream(question):
    messages.append({"role": "user", "content": question})

    response = g4f.ChatCompletion.create(
        model=g4f.models.gpt_4,
        messages=messages,
        stream=True,
        provider=g4f.Provider.Bing,
    )
    
    for message in response:
        yield message

@app.route("/get")
def get_bot_response():
    userText = request.args.get('msg')
    
    return Response(generate_text_stream(str(userText)), content_type='text/plain')

if __name__ == '__main__':
    app.run(debug=True)
