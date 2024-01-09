from flask import Flask, Response, render_template, request, session
import g4f
from flask_kvsession import KVSessionExtension
import pandas as pd
from simplekv.fs import FilesystemStore

# Define the app using Flask
app = Flask(__name__)
app.secret_key = 'secretkey'

data = {}

store = FilesystemStore('./data/user_sessions')
KVSessionExtension(store, app)

med_data = pd.read_excel(
    './data/medicine_details/medicine.xlsx', sheet_name=None)


@app.route('/')
def index():

    return render_template('index.html', data=data)


@app.route('/my-cabinet')
def about():

    data = {'tab_name': 'My Cabinet', 'illnesses': med_data['types']}

    return render_template('my-cabinet.html', data=data)


@app.route('/medicine-list')
def medicine_list():
    typeId = int(request.args.get('typeId'))

    medicine = med_data['medicine'][med_data['medicine'].type == typeId]

    data = {'tab_name': 'Medicine List', 'medicine': medicine,
            'medicine_name': med_data['types'].iloc[typeId]['name']}

    return render_template('medicine-list.html', data=data)


@app.route('/medicine-details')
def medicine_details():
    med_id = int(request.args.get('medId'))

    med_details = med_data['medicine'].iloc[med_id]

    data = {'tab_name': med_details['name'], 'med': med_details}

    return render_template('medicine-details.html', data=data)


@app.route("/get", methods=['GET'])
def get_bot_response():
    userText = request.args.get('msg')

    system_message = {"role": "system", "content": "You are Medi-bot, a medical chatbot. You will ask questions about any illness which the user may be having and will then inform the user on whether they need antibiotics or not. You will also ask follow up questions to narrow down the solution, such as age and severity of issue. If the user asks a non medical question respond with: 'This question is not within my scope'"}

    if 'messages' not in session:
        session['messages'] = [{"role": "user", "content": userText}]
    else:
        messages = session['messages']
        messages.append({"role": "user", "content": userText})
        session['messages'] = messages

    current_messages = [system_message] + session['messages'][-4:]
    
    response = g4f.ChatCompletion.create(
        model=g4f.models.gpt_4,
        messages=current_messages,
        stream=True,
        provider=g4f.Provider.Bing,
        cookies={"Fake": ""}
    )

    def generate_text_stream(response):
        for message in response:
            yield message

    return Response(generate_text_stream(response), content_type='text/plain')


@app.route("/save_bot_response", methods=['POST'])
def save_bot_response():
    # Assuming the botText is sent as raw data in the request body
    bot_text = request.get_data(as_text=True)

    current_messages = session['messages']
    current_messages.append({"role": "Medi-bot", "content": bot_text})

    session['messages'] = current_messages

    # You can return any response as needed
    return "Bot response saved successfully"


if __name__ == '__main__':
    app.run(debug=True)
