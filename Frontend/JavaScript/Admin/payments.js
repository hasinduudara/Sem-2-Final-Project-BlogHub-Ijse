// Admin Payments Dashboard JavaScript
let currentPage = 1;
const itemsPerPage = 10;
let allPayments = [];
let filteredPayments = [];

// Initialize the page when DOM is loaded
$(document).ready(function() {
    checkAdminAuth();
    initializePage();
});

function checkAdminAuth() {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");

    if (!token || userRole !== "ADMIN") {
        window.location.href = "../../pages/login-and-register/login-and-register.html";
        return;
    }
}

function initializePage() {
    loadPaymentData();
    setupEventListeners();
    setDefaultDateRange();
}

function setupEventListeners() {
    // Logout button
    $('#logoutBtn').click(function() {
        localStorage.clear();
        window.location.href = "../../pages/login-and-register/login-and-register.html";
    });

    // Filter buttons
    $('#applyFilters').click(applyFilters);
    $('#clearFilters').click(clearFilters);

    // Export button
    $('#exportPayments').click(exportToCSV);
}

function setDefaultDateRange() {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

    $('#dateTo').val(today.toISOString().split('T')[0]);
    $('#dateFrom').val(thirtyDaysAgo.toISOString().split('T')[0]);
}

async function loadPaymentData() {
    try {
        showLoading(true);
        const token = localStorage.getItem("token");

        const response = await $.ajax({
            url: "http://localhost:8080/mybookings/payments",
            method: "GET",
            headers: { "Authorization": "Bearer " + token },
        });

        allPayments = response || [];
        filteredPayments = [...allPayments];

        updateStatistics();
        displayPayments();
        setupPagination();

        showLoading(false);

    } catch (error) {
        console.error("Error loading payments:", error);
        showLoading(false);
        showNoData();

        // Show error message
        Swal.fire({
            icon: 'error',
            title: 'Error Loading Payments',
            text: 'Unable to load payment data. Please try again later.',
            background: '#2d2d2d',
            color: '#fff'
        });
    }
}

function updateStatistics() {
    const completedPayments = filteredPayments.filter(p => p.paymentStatus === 'COMPLETED');
    const totalRevenue = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Calculate monthly revenue
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyPayments = completedPayments.filter(payment => {
        const paymentDate = new Date(payment.paymentDate);
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    });
    const monthlyRevenue = monthlyPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // Update statistics cards
    $('#totalRevenue').text(`LKR ${totalRevenue.toLocaleString('en-US', {minimumFractionDigits: 2})}`);
    $('#totalPayments').text(filteredPayments.length.toLocaleString());
    $('#completedPayments').text(completedPayments.length.toLocaleString());
    $('#monthlyRevenue').text(`LKR ${monthlyRevenue.toLocaleString('en-US', {minimumFractionDigits: 2})}`);
}

function displayPayments() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paymentsToShow = filteredPayments.slice(startIndex, endIndex);

    const tableBody = $('#paymentTableBody');
    tableBody.empty();

    if (paymentsToShow.length === 0) {
        showNoData();
        return;
    }

    paymentsToShow.forEach(payment => {
        const row = createPaymentRow(payment);
        tableBody.append(row);
    });

    $('#paymentTableContainer').show();
    $('#noDataMessage').hide();
}

function createPaymentRow(payment) {
    const paymentDate = new Date(payment.paymentDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const statusBadge = getStatusBadge(payment.paymentStatus);
    const payerName = `User #${payment.payerId}`; // You can enhance this with actual user names

    return `
        <tr>
            <td>#${payment.id}</td>
            <td>${payerName}</td>
            <td class="text-success fw-bold">LKR ${payment.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
            <td>
                <i class="fas fa-credit-card me-1"></i>${payment.paymentMethod}
            </td>
            <td>${statusBadge}</td>
            <td>
                <small class="text-muted">${paymentDate}</small>
            </td>
            <td>
                <code class="text-info">${payment.transactionId}</code>
            </td>
            <td>
                <button class="btn btn-outline-primary btn-sm me-1" onclick="viewPaymentDetails(${payment.id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-outline-secondary btn-sm" onclick="copyTransactionId('${payment.transactionId}')">
                    <i class="fas fa-copy"></i>
                </button>
            </td>
        </tr>
    `;
}

function getStatusBadge(status) {
    const badges = {
        'COMPLETED': '<span class="badge bg-success"><i class="fas fa-check me-1"></i>Completed</span>',
        'PENDING': '<span class="badge bg-warning"><i class="fas fa-clock me-1"></i>Pending</span>',
        'FAILED': '<span class="badge bg-danger"><i class="fas fa-times me-1"></i>Failed</span>',
        'CANCELLED': '<span class="badge bg-secondary"><i class="fas fa-ban me-1"></i>Cancelled</span>',
        'REFUNDED': '<span class="badge bg-info"><i class="fas fa-undo me-1"></i>Refunded</span>'
    };
    return badges[status] || `<span class="badge bg-secondary">${status}</span>`;
}

function setupPagination() {
    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
    const pagination = $('#pagination');
    pagination.empty();

    if (totalPages <= 1) return;

    // Previous button
    pagination.append(`
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link bg-dark border-secondary text-light" href="#" onclick="changePage(${currentPage - 1})">Previous</a>
        </li>
    `);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            pagination.append(`
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link ${i === currentPage ? 'bg-primary border-primary' : 'bg-dark border-secondary text-light'}" 
                       href="#" onclick="changePage(${i})">${i}</a>
                </li>
            `);
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            pagination.append('<li class="page-item disabled"><span class="page-link bg-dark border-secondary">...</span></li>');
        }
    }

    // Next button
    pagination.append(`
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link bg-dark border-secondary text-light" href="#" onclick="changePage(${currentPage + 1})">Next</a>
        </li>
    `);
}

function changePage(page) {
    const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;

    currentPage = page;
    displayPayments();
    setupPagination();
}

function applyFilters() {
    const statusFilter = $('#statusFilter').val();
    const dateFrom = $('#dateFrom').val();
    const dateTo = $('#dateTo').val();

    filteredPayments = allPayments.filter(payment => {
        // Status filter
        if (statusFilter && payment.paymentStatus !== statusFilter) {
            return false;
        }

        // Date filter
        const paymentDate = new Date(payment.paymentDate);
        if (dateFrom && paymentDate < new Date(dateFrom)) {
            return false;
        }
        if (dateTo && paymentDate > new Date(dateTo + 'T23:59:59')) {
            return false;
        }

        return true;
    });

    currentPage = 1;
    updateStatistics();
    displayPayments();
    setupPagination();
}

function clearFilters() {
    $('#statusFilter').val('');
    $('#dateFrom').val('');
    $('#dateTo').val('');

    filteredPayments = [...allPayments];
    currentPage = 1;
    updateStatistics();
    displayPayments();
    setupPagination();
}

function viewPaymentDetails(paymentId) {
    const payment = allPayments.find(p => p.id === paymentId);
    if (!payment) return;

    const paymentDate = new Date(payment.paymentDate).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const modalBody = $('#paymentModalBody');
    modalBody.html(`
        <div class="row">
            <div class="col-md-6">
                <h6 class="text-primary">Payment Information</h6>
                <table class="table table-dark table-sm">
                    <tr><td><strong>Payment ID:</strong></td><td>#${payment.id}</td></tr>
                    <tr><td><strong>Transaction ID:</strong></td><td><code class="text-info">${payment.transactionId}</code></td></tr>
                    <tr><td><strong>Exchange ID:</strong></td><td>${payment.exchangeId}</td></tr>
                    <tr><td><strong>Amount:</strong></td><td class="text-success fw-bold">LKR ${payment.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}</td></tr>
                    <tr><td><strong>Status:</strong></td><td>${getStatusBadge(payment.paymentStatus)}</td></tr>
                </table>
            </div>
            <div class="col-md-6">
                <h6 class="text-primary">Transaction Details</h6>
                <table class="table table-dark table-sm">
                    <tr><td><strong>Payer ID:</strong></td><td>User #${payment.payerId}</td></tr>
                    <tr><td><strong>Payment Method:</strong></td><td><i class="fas fa-credit-card me-1"></i>${payment.paymentMethod}</td></tr>
                    <tr><td><strong>Payment Date:</strong></td><td>${paymentDate}</td></tr>
                    <tr><td><strong>Description:</strong></td><td>${payment.description || 'N/A'}</td></tr>
                </table>
            </div>
        </div>
        ${payment.payHerePaymentId ? `
        <div class="mt-3">
            <h6 class="text-primary">PayHere Details</h6>
            <p><strong>PayHere Payment ID:</strong> <code class="text-warning">${payment.payHerePaymentId}</code></p>
        </div>
        ` : ''}
    `);

    $('#paymentModal').modal('show');
}

function copyTransactionId(transactionId) {
    navigator.clipboard.writeText(transactionId).then(() => {
        Swal.fire({
            icon: 'success',
            title: 'Copied!',
            text: 'Transaction ID copied to clipboard',
            timer: 1500,
            showConfirmButton: false,
            background: '#2d2d2d',
            color: '#fff'
        });
    });
}

function exportToCSV() {
    if (filteredPayments.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'No Data',
            text: 'No payments to export',
            background: '#2d2d2d',
            color: '#fff'
        });
        return;
    }

    const headers = ['ID', 'Payer ID', 'Amount (LKR)', 'Method', 'Status', 'Date', 'Transaction ID', 'Description'];
    const csvContent = [
        headers.join(','),
        ...filteredPayments.map(payment => [
            payment.id,
            payment.payerId,
            payment.amount,
            payment.paymentMethod,
            payment.paymentStatus,
            new Date(payment.paymentDate).toISOString(),
            payment.transactionId,
            `"${payment.description || ''}"`
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

function showLoading(show) {
    if (show) {
        $('#loadingSpinner').show();
        $('#paymentTableContainer').hide();
        $('#noDataMessage').hide();
    } else {
        $('#loadingSpinner').hide();
    }
}

function showNoData() {
    $('#paymentTableContainer').hide();
    $('#noDataMessage').show();
    $('#loadingSpinner').hide();
}
