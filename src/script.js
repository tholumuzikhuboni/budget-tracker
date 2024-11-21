const expenseForm = document.getElementById('expenseForm');
const transactionType = document.getElementById('transactionType');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const balanceElement = document.getElementById('balance');
const transactionList = document.getElementById('transactionList');
const downloadPDFButton = document.getElementById('downloadPDF');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let balance = parseFloat(localStorage.getItem('balance')) || 0;

// Update balance
function updateBalance() {
    balanceElement.innerHTML = `<h3>R${balance.toFixed(2)}</h3>`;
    localStorage.setItem('balance', balance.toString());
}

// Render transactions
function renderTransactions() {
    transactionList.innerHTML = '';
    transactions.forEach(transaction => {
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item', transaction.type);
        const dateFormatted = new Date(transaction.date).toLocaleDateString();

        listItem.innerHTML = `
            <span>${transaction.category} - R${transaction.amount.toFixed(2)}</span>
            <span>${dateFormatted}</span>
        `;
        transactionList.appendChild(listItem);
    });
}

// Add transaction
function addTransaction(event) {
    event.preventDefault();
    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value;
    const type = transactionType.value;
    const date = new Date(document.getElementById('transactionDate').value);

    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    const transaction = {
        id: new Date().getTime().toString(),
        amount: amount,
        category: category,
        type: type,
        date: date
    };

    transactions.push(transaction);

    if (type === 'income') {
        balance += amount;
    } else {
        balance -= amount;
    }

    localStorage.setItem('transactions', JSON.stringify(transactions));
    expenseForm.reset();
    updateBalance();
    renderTransactions();
}

// Download PDF
function downloadPDF() {
    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF();

    // Header
    pdf.setFontSize(16);
    pdf.text('Budget Tracker App', 20, 20);
    pdf.setFontSize(12);
    pdf.text('www.tholumuzi.co.za', 20, 30);
    pdf.text('contact@tholumuzi.co.za', 20, 40);

    // Summary Section
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const currentBalance = balance;

    pdf.setFontSize(14);
    pdf.text(`Total Income: R${totalIncome.toFixed(2)}`, 20, 60);
    pdf.text(`Total Expense: R${totalExpense.toFixed(2)}`, 20, 70);
    pdf.text(`Remaining Balance: R${currentBalance.toFixed(2)}`, 20, 80);

    // Transaction Table
    const headers = [['Category', 'Amount', 'Type', 'Date']];
    const data = transactions.map(transaction => [
        transaction.category,
        `R${transaction.amount.toFixed(2)}`,
        transaction.type,
        new Date(transaction.date).toLocaleDateString()
    ]);

    pdf.autoTable({
        startY: 90,
        head: headers,
        body: data,
        theme: 'grid',
        styles: {
            halign: 'center'
        }
    });

    // Footer
    pdf.setFontSize(10);
    pdf.text('Copyright © 2024 Budget Tracker', pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() - 10, {
        align: 'center'
    });

    pdf.save('transaction_history.pdf');
}

expenseForm.addEventListener('submit', addTransaction);
downloadPDFButton.addEventListener('click', downloadPDF);
window.onload = function() {
    updateBalance();
    renderTransactions();
};
