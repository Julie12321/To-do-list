from openai import OpenAI

# Set your OpenAI API key here directly
api_key = 'REMOVED'

client = OpenAI(api_key=api_key)


def get_task_suggestion(task):
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": f"Provide a recommendation or suggestion for completing the task: '{task}'"}
            ]
        )

        # Accessing the suggestion from the response
        suggestion = response.choices[0].message.content
        return suggestion
    except Exception as e:
        print(f"Error during OpenAI API call: {e}")
        return "No suggestion available."


# Test the function
test_task = "Write a report"
print(get_task_suggestion(test_task))
