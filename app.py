from flask import Flask, jsonify, request, render_template
from openai import OpenAI

app = Flask(__name__)
OpenAI.api_key = 'REMOVED'
client = OpenAI(api_key=OpenAI.api_key)

tasks = []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/tasks', methods=['GET', 'POST', 'DELETE'])
def manage_tasks():
    if request.method == 'GET':
        return jsonify(tasks)
    if request.method == 'POST':
        task = request.json.get('task')
        category = categorize_task(task)
        tasks.append({'text': task, 'category': category})
        return jsonify(tasks)
    elif request.method == 'DELETE':
        task_text = request.json.get('task')
        tasks[:] = [task for task in tasks if task['text'] != task_text]
        return jsonify(tasks)

@app.route('/suggest', methods=['POST'])
def suggest():
    task = request.json.get('task')
    suggestion = get_task_suggestion(task)
    return jsonify({'suggestion': suggestion})

def categorize_task(task):
    response = client.completions.create(model="text-davinci-003",
                                         prompt=f"Categorize the following task into work, school, or personal: {task}\n\nCategory:",
                                         max_tokens=10)
    category = response.choices[0].text.strip().lower()
    if category not in ["work", "school", "personal"]:
        category = "personal"  # Default category if the output is not one of the expected categories
    return category

def get_task_suggestion(task):
    try:
        prompt_text = (
            "I am an intelligent assistant capable of providing detailed, practical, "
            "and actionable suggestions for completing tasks efficiently. "
            "Given a specific task, My responses will not exceed three bullet points or 40 words."
            "I offer a step-by-step approach, considering time management, resources required, "
            "and best practices for optimal results.\n\n"
            f"Task: '{task}'\n"
            "Suggestion:"
        )

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": prompt_text},
                {"role": "user", "content": f"Please provide a suggestion for the above task."}
            ]
        )
        suggestion = response.choices[0].message.content
        return suggestion
    except Exception as e:
        print(f"Error during OpenAI API call: {e}")
        return "No suggestion available."

if __name__ == '__main__':
    app.run(debug=True)

