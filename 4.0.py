import tkinter as tk
from tkinter import messagebox, simpledialog, font
from openai import OpenAI

# OpenAI API Integration
api_key = 'YOUR_API_KEY_HER'
client = OpenAI(api_key=api_key)

def categorize_task(task):
    response = client.completions.create(model="text-davinci-003",
    prompt=f"Categorize the following task into work, school, or personal: {task}\n\nCategory:",
    max_tokens=10)
    category = response.choices[0].text.strip().lower()
    if category not in ["work", "school", "personal"]:
        category = "personal"  # Default category if the output is not one of the expected categories
    return category

# Color mapping for categories
category_colors = {
    "work": "light blue",
    "school": "light green",
    "personal": "light yellow"
}

def get_task_suggestion(task):
    try:
        prompt_text = (
            "I am an intelligent assistant capable of providing detailed, practical, "
            "and actionable suggestions for completing tasks efficiently. Given a specific task, "
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

def on_task_double_click(event, task):
    suggestion = get_task_suggestion(task)
    messagebox.showinfo("Task Suggestion", suggestion)

def add_task(event=None):
    task_text = task_entry.get()
    if task_text:
        tasks.append(task_text)
        update_tasks()
        task_entry.delete(0, tk.END)
    else:
        messagebox.showwarning("Warning", "You must enter a task.")

def delete_task(index):
    del tasks[index]
    update_tasks()


def update_tasks():
    for widget in task_frame.winfo_children():
        widget.destroy()
    for task in tasks:
        category = categorize_task(task)
        color = category_colors.get(category, "white")
        row_frame = tk.Frame(task_frame, bg=color)
        row_frame.pack(fill='x', expand=True)
        row_frame.bind("<Double-1>", lambda event, task=task: on_task_double_click(event, task))
        cb = tk.Checkbutton(row_frame, text=task, font=('Arial', 20), bg=color, command=lambda task=task: delete_task(tasks.index(task)))
        cb.pack(side='left', padx=10)
        delete_button = tk.Button(row_frame, text="Delete", command=lambda task=task: delete_task(tasks.index(task)), font=('Arial', 14))
        delete_button.pack(side='right', padx=10)

def check_task(index, cb_var):
    if cb_var.get():
        delete_task(index)

root = tk.Tk()
root.title("To-Do List")
root.configure(bg='beige')

# Define font styles
title_font = font.Font(family='Comic Sans MS', size=40, weight='bold')

# Title area
title_frame = tk.Frame(root, bg='beige', height=100)
title_frame.pack(fill='x')
title_label = tk.Label(title_frame, text="To Do List", font=title_font, bg='beige')
title_label.pack(pady=20)

# Input area
input_frame = tk.Frame(root, bg='beige', height=100)
input_frame.pack(fill='x')
task_entry = tk.Entry(input_frame, width=50, font=('Arial', 20))
task_entry.pack(side='left', padx=(50, 10), pady=20, expand=True)
add_button = tk.Button(input_frame, text="Add Task", command=add_task, font=('Arial', 14))
add_button.pack(side='right', padx=(10, 50), pady=20)
task_entry.bind("<Return>", add_task)

# Task list area
task_frame = tk.Frame(root, bg='beige')
task_frame.pack(fill='both', expand=True)

# List to store tasks and checkbox variables
tasks = []
checkboxes = []

update_tasks()

root.mainloop()
