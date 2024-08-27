import tkinter as tk
from tkinter import messagebox, font

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
    # Clear all current task widgets and checkbox references
    for widget in task_frame.winfo_children():
        widget.destroy()
    checkboxes.clear()

    # Add new task widgets and update checkbox references
    for i, task in enumerate(tasks):
        row_frame = tk.Frame(task_frame, bg='beige')
        row_frame.pack(fill='x', expand=True)

        cb_var = tk.BooleanVar()
        cb = tk.Checkbutton(row_frame, text=task, font=('Arial', 20), bg='beige', variable=cb_var, command=lambda i=i, cb_var=cb_var: check_task(i, cb_var))
        cb.pack(side='left', padx=10)
        checkboxes.append(cb_var)

        delete_button = tk.Button(row_frame, text="Delete", command=lambda i=i: delete_task(i), font=('Arial', 14))
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
