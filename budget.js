document.addEventListener("DOMContentLoaded", function() {
    // Get elements
    const budgetAmountInput = document.getElementById("budget_amount");
    const initiateButton = document.getElementById("initiate");
    const resetButton = document.getElementById("reset");
    const expenseTitleInput = document.getElementById("expense_title");
    const expenseAmountInput = document.getElementById("expense_amount");
    const addButton = document.getElementById("add");
    const displayBudgetAmount = document.getElementById("diplay_budget_amount");
    const displayExpenseAmount = document.getElementById("diplay_expense_amount");
    const displayBalanceAmount = document.getElementById("diplay_bbalance_amount");
    const expensesList = document.getElementById("expenses_list");

    let budget = 0;
    let expenses = [];

    // Function to update display
    function updateDisplay() {
        displayBudgetAmount.textContent = budget.toFixed(2);
        const totalExpense = expenses.reduce((acc, expense) => acc + parseFloat(expense.amount), 0);
        displayExpenseAmount.textContent = totalExpense.toFixed(2);
        displayBalanceAmount.textContent = (budget - totalExpense).toFixed(2);

        // Clear expenses list
        expensesList.innerHTML = "";
        // Populate expenses list
        expenses.forEach((expense, index) => {
            const li = document.createElement("li");
            li.textContent = `${expense.title}: $${expense.amount}`;
            const removeButton = document.createElement("button");
            removeButton.textContent = "Remove";
            removeButton.addEventListener("click", function() {
                expenses.splice(index, 1);
                updateDisplay();
            });
            li.appendChild(removeButton);
            expensesList.appendChild(li);
        });
    }

    // Initiate button click handler
    initiateButton.addEventListener("click", function() {
        const initialBudget = parseFloat(budgetAmountInput.value);
        if (!isNaN(initialBudget) && initialBudget > 0) {
            budget = initialBudget;
            updateDisplay();
        } else {
            alert("Please enter a valid budget amount greater than 0.");
        }
    });

    // Reset button click handler
    resetButton.addEventListener("click", function() {
        budgetAmountInput.value = "";
        expenseTitleInput.value = "";
        expenseAmountInput.value = "";
        budget = 0;
        expenses = [];
        updateDisplay();
    });

    // Add button click handler
    addButton.addEventListener("click", function() {
        const title = expenseTitleInput.value.trim();
        const amount = parseFloat(expenseAmountInput.value);
        if (title !== "" && !isNaN(amount) && amount > 0) {
            expenses.push({ title, amount });
            updateDisplay();
            // Clear input fields
            expenseTitleInput.value = "";
            expenseAmountInput.value = "";
        } else {
            alert("Please enter a valid expense title and amount greater than 0.");
        }
    });
});
