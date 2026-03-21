import { useEffect, useState } from 'react'
import logo from './assets/react.svg'
import './App.css'

function App() {
  const [todos, setTodos] = useState([]);
  const [taskdescription, setTaskdescription] = useState("");
  const [completedTasks, setCompletedTasks] = useState({});
  const [selectedTasks, setSelectedTasks] = useState({});
  const [completedHistory, setCompletedHistory] = useState(() => {
    const historyFromStorage = localStorage.getItem("completedHistory");
    if (!historyFromStorage) {
      return [];
    }
    try {
      return JSON.parse(historyFromStorage);
    } catch (error) {
      console.log(error);
      return [];
    }
  });

  const loadTodos = () => {
    fetch("http://localhost:8080/")
      .then(response => response.json())
      .then(data => {
        setTodos(data);
        setCompletedTasks((prevCompletedTasks) => {
          const nextCompletedTasks = {};
          data.forEach((todo) => {
            if (prevCompletedTasks[todo.taskdescription]) {
              nextCompletedTasks[todo.taskdescription] = true;
            }
          });
          return nextCompletedTasks;
        });
        setSelectedTasks((prevSelectedTasks) => {
          const nextSelectedTasks = {};
          data.forEach((todo) => {
            if (prevSelectedTasks[todo.taskdescription]) {
              nextSelectedTasks[todo.taskdescription] = true;
            }
          });
          return nextSelectedTasks;
        });
      })
      .catch(error => console.log(error));
  }

  /** Is called when the html form is submitted. It sends a POST request to the API endpoint '/tasks' and updates the component's state with the new todo.
  ** In this case a new taskdecription is added to the actual list on the server.
  */
  const handleSubmit = event => {
    event.preventDefault();
    console.log("Sending task description to Spring-Server: "+taskdescription);
    fetch("http://localhost:8080/tasks", {  // API endpoint (the complete URL!) to save a taskdescription
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ taskdescription: taskdescription }) // both 'taskdescription' are identical to Task-Class attribute in Spring
    })
    .then(response => {
      console.log("Receiving answer after sending to Spring-Server: ");
      console.log(response);
      loadTodos();
      setTaskdescription("");             // clear input field, preparing it for the next input
    })
    .catch(error => console.log(error))
  }

   /** Is called when ever the html input field value below changes to update the component's state.
  ** This is, because the submit should not take the field value directly.
  ** The task property in the state is used to store the current value of the input field as the user types into it.
  ** This is necessary because React operates on the principle of state and props, which means that a component's state
  ** determines the component's behavior and render.
  ** If we used the value directly from the HTML form field, we wouldn't be able to update the component's state and react to changes in the input field.
  */
  const handleChange = event => {
    setTaskdescription(event.target.value);
  }


  /** Is called when the component is mounted (after any refresh or F5).
  ** It updates the component's state with the fetched todos from the API Endpoint '/'.
  */
  useEffect(() => {
    loadTodos();
  }, []);

  useEffect(() => {
    localStorage.setItem("completedHistory", JSON.stringify(completedHistory));
  }, [completedHistory]);


 /** Is called when the delete button is pressed. It sends a POST request to the API endpoint '/delete' and updates the component's state with the new todo.
  ** In this case if the task with the unique taskdescription is found on the server, it will be removed from the list.
  */
  const handleDelete = (taskdescription) => {
    console.log("Sending task description to delete on Spring-Server: "+taskdescription);
    fetch(`http://localhost:8080/delete`, { // API endpoint (the complete URL!) to delete an existing taskdescription in the list
      method: "POST",
      body: JSON.stringify({ taskdescription: taskdescription }),
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(response => {
      console.log("Receiving answer after deleting on Spring-Server: ");
      console.log(response);
      setCompletedTasks((prevCompletedTasks) => {
        const nextCompletedTasks = { ...prevCompletedTasks };
        delete nextCompletedTasks[taskdescription];
        return nextCompletedTasks;
      });
      setSelectedTasks((prevSelectedTasks) => {
        const nextSelectedTasks = { ...prevSelectedTasks };
        delete nextSelectedTasks[taskdescription];
        return nextSelectedTasks;
      });
      loadTodos();
    })
    .catch(error => console.log(error))
  }

  const handleToggleDone = (taskdescription) => {
    setCompletedTasks((prevCompletedTasks) => {
      const willBeDone = !prevCompletedTasks[taskdescription];

      if (willBeDone) {
        setCompletedHistory((prevHistory) => {
          if (prevHistory.some((entry) => entry.taskdescription === taskdescription)) {
            return prevHistory;
          }
          return [
            ...prevHistory,
            {
              taskdescription,
              completedAt: new Date().toLocaleString("de-CH")
            }
          ];
        });
      }

      return {
        ...prevCompletedTasks,
        [taskdescription]: willBeDone
      };
    });
  }

  const handleToggleSelect = (taskdescription) => {
    setSelectedTasks((prevSelectedTasks) => ({
      ...prevSelectedTasks,
      [taskdescription]: !prevSelectedTasks[taskdescription]
    }));
  }

  const handleToggleSelectAll = () => {
    const allSelected = todos.length > 0 && todos.every((todo) => selectedTasks[todo.taskdescription]);

    if (allSelected) {
      setSelectedTasks({});
      return;
    }

    const nextSelectedTasks = {};
    todos.forEach((todo) => {
      nextSelectedTasks[todo.taskdescription] = true;
    });
    setSelectedTasks(nextSelectedTasks);
  }

  const handleMarkSelectedDone = () => {
    const selectedTaskDescriptions = todos
      .filter((todo) => selectedTasks[todo.taskdescription])
      .map((todo) => todo.taskdescription);

    if (selectedTaskDescriptions.length === 0) {
      return;
    }

    const completedAt = new Date().toLocaleString("de-CH");

    setCompletedTasks((prevCompletedTasks) => {
      const nextCompletedTasks = { ...prevCompletedTasks };
      selectedTaskDescriptions.forEach((taskdescription) => {
        nextCompletedTasks[taskdescription] = true;
      });
      return nextCompletedTasks;
    });

    setCompletedHistory((prevHistory) => {
      const alreadyInHistory = new Set(prevHistory.map((entry) => entry.taskdescription));
      const newEntries = selectedTaskDescriptions
        .filter((taskdescription) => !alreadyInHistory.has(taskdescription))
        .map((taskdescription) => ({ taskdescription, completedAt }));
      return [...prevHistory, ...newEntries];
    });

    setSelectedTasks({});
  }

  const handleDeleteSelected = () => {
    const selectedTaskDescriptions = todos
      .filter((todo) => selectedTasks[todo.taskdescription])
      .map((todo) => todo.taskdescription);

    if (selectedTaskDescriptions.length === 0) {
      return;
    }

    Promise.all(
      selectedTaskDescriptions.map((taskdescription) =>
        fetch("http://localhost:8080/delete", {
          method: "POST",
          body: JSON.stringify({ taskdescription }),
          headers: {
            "Content-Type": "application/json"
          }
        })
      )
    )
      .then(() => {
        setCompletedTasks((prevCompletedTasks) => {
          const nextCompletedTasks = { ...prevCompletedTasks };
          selectedTaskDescriptions.forEach((taskdescription) => {
            delete nextCompletedTasks[taskdescription];
          });
          return nextCompletedTasks;
        });
        setSelectedTasks({});
        loadTodos();
      })
      .catch(error => console.log(error));
  }

  /**
   * render all task lines
   * @param {*} todos : Task list
   * @returns html code snippet
  */
  const renderTasks = (todos) => {
    const selectedCount = todos.filter((todo) => selectedTasks[todo.taskdescription]).length;
    const allSelected = todos.length > 0 && selectedCount === todos.length;

    return (
      <>
        <div className="group-select-bar">
          <label className="select-all-control">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={handleToggleSelectAll}
            />
            <span>Alle markieren</span>
          </label>
          <div className="group-actions">
            {/* Zaehler: zeigt dynamisch an, wie viele Tasks aktuell ausgewaehlt sind */}
            <span className={`selected-count ${selectedCount > 0 ? "has-selection" : ""}`}>
              {selectedCount} von {todos.length} ausgewaehlt
            </span>
            <button
              type="button"
              className="bulk-btn bulk-done"
              onClick={handleMarkSelectedDone}
              disabled={selectedCount === 0}
            >
              Ausgewaehlte erledigen
            </button>
            <button
              type="button"
              className="bulk-btn bulk-delete"
              onClick={handleDeleteSelected}
              disabled={selectedCount === 0}
            >
              Ausgewaehlte loeschen
            </button>
          </div>
        </div>
        <ul className="todo-list">
          {todos.map((todo, index) => (
            <li key={todo.taskdescription} className={selectedTasks[todo.taskdescription] ? "todo-selected" : ""}>
              <input
                type="checkbox"
                className="todo-select-checkbox"
                checked={!!selectedTasks[todo.taskdescription]}
                onChange={() => handleToggleSelect(todo.taskdescription)}
                title="Todo fuer Gruppenauswahl markieren"
              />
            <span className={completedTasks[todo.taskdescription] ? "todo-done" : ""}>
              {"Task " + (index+1) + ": "+ todo.taskdescription}
            </span>
            <div className="todo-actions">
              <button
                type="button"
                className={`done-btn ${completedTasks[todo.taskdescription] ? "is-done" : ""}`}
                onClick={() => handleToggleDone(todo.taskdescription)}
                title="Als erledigt markieren"
              >
                &#10004;
              </button>
              <button
                type="button"
                className="delete-btn"
                onClick={() => handleDelete(todo.taskdescription)}
                title="Todo loeschen"
              >
                X
              </button>
            </div>
            </li>
          ))}
        </ul>
      </>
    );
  }

  const renderHistory = (history) => {
    if (history.length === 0) {
      return <p className="history-empty">Noch keine erledigten Todos.</p>;
    }

    return (
      <ul className="history-list">
        {history.map((entry, index) => (
          <li key={`${entry.taskdescription}-${entry.completedAt}`}>
            <span>{`${index + 1}. ${entry.taskdescription}`}</span>
            <span className="history-time">{entry.completedAt}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>
          ToDo Liste
        </h1>
        <form onSubmit={handleSubmit} className='todo-form'>
          <label htmlFor="taskdescription">Neues Todo anlegen:</label>
          <input
            type="text"
            value={taskdescription}
            onChange={handleChange}
          />
          <button type="submit">Absenden</button>
        </form>
        <div>
          {renderTasks(todos)}
        </div>
        <section className="history-section">
          <h2>ToDo History</h2>
          {renderHistory(completedHistory)}
        </section>
      </header>
    </div>
  );
}

export default App
