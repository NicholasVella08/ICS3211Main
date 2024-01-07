import g4f

# g4f.debug.logging = True # enable logging
# g4f.check_version = False # Disable automatic version checking
# print(g4f.version) # check version
# print(g4f.Provider.Ails.params)  # supported args

# Automatic selection of provider
messages = [{"role": "system", "content": "Make quick short replies with general details. You are Medi-Bot a medical chatbot with the purpose of informing the user on whether the illness they are experiencing requires any antibiotics. Do not introduce yourself unless a user asks. You should also ask follow up questions to narrow down the solution, such as age and severity of issue."}]

messages = [{"role": "system", "content": "I want you to act like a medical chatbot named Medi-bot. The chatbot will ask questions about the illness which a user may be having and will then inform the user on whether they need antibiotics or not. The chatbot will also ask follow up questions to narrow down the solution, such as age and severity of issue."}]

# streamed completion
while True:
    question = input("\n[USER]: ")
    messages.append({"role": "user", "content": question})

    response = g4f.ChatCompletion.create(
        model=g4f.models.gpt_4,
        messages=messages,
        stream=True,
        provider=g4f.Provider.Bing,
    )

    print("\n[MEDI-BOT]: ", end='')
    for message in response:
        print(message, flush=True, end='')


# # normal response
# response = g4f.ChatCompletion.create(
#     model=g4f.models.gpt_4,
#     messages=[{"role": "user", "content": "Hello"}],
# )  # alternative model setting

# print(response)