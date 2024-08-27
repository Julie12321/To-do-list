tasks = []

def add_task():
    task = input("Please enter a task:")
    tasks.append(task)
    print("Task added!")

def view_tasks():
    if tasks:
        print("Tasks:")
        for i, task in enumerate (tasks):
            print(f"{i+1},{task}")
    else:
        print("No tasks to show.")

def delete_task():
    view_tasks()
    if tasks:
        try:
            task_index = int(input("Enter the task number to delete: ")) - 1
            if 0 <= task_index < len(tasks):
                del tasks[task_index]
                print("Task deleted!")
            else:
                print("Invalid task number.")
        except ValueError:
            print("Please enter a valid number.")

def run_app():
    while True:
        print("\nTo-Do List App")
        print("1. Add Task")
        print("2. View Tasks")
        print("3. Delete Task")
        print("4. Exit")
        choice = input("Choose an option: ")

        if choice == "1":
            add_task()
        elif choice == "2":
            view_tasks()
        elif choice == "3":
            delete_task()
        elif choice == "4":
            print("Exiting the app...")
            break
        else:
            print("Invalid choice. Please try again.")

run_app()

