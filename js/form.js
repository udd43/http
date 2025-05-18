// js/form.js
const API_BASE = 'http://localhost:8080';
const API_PATH = '/api/books';

document.addEventListener('DOMContentLoaded', () => {
  const bookForm         = document.getElementById('book-form');
  const titleInput       = document.getElementById('title');
  const authorInput      = document.getElementById('author');
  const isbnInput        = document.getElementById('isbn');
  const priceInput       = document.getElementById('price');
  const publishDateInput = document.getElementById('publishDate');
  const bookIdInput      = document.getElementById('bookId');
  const messageDiv       = document.getElementById('message');
  const tableBody        = document.querySelector('#book-table tbody');
  const submitButton     = bookForm.querySelector('button[type="submit"]');

  // 도서 목록 조회
  function fetchAndDisplayBooks() {
    const url = `${API_BASE}${API_PATH}`;
    console.log('📡 GET', url);
    fetch(url, { mode: 'cors' })
      .then(response => {
        if (!response.ok) throw new Error(`status: ${response.status}`);
        return response.json();
      })
      .then(books => {
        tableBody.innerHTML = '';
        books.forEach(book => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${book.id}</td>
            <td>${book.title}</td>
            <td>${book.author || ''}</td>
            <td>${book.isbn}</td>
            <td>${book.price != null ? book.price : ''}</td>
            <td>${book.publishDate || ''}</td>
            <td>
              <button class="edit-btn" data-id="${book.id}">수정</button>
              <button class="delete-btn" data-id="${book.id}">삭제</button>
            </td>
          `;
          tableBody.appendChild(tr);
        });
      })
      .catch(err => {
        console.error(err);
        messageDiv.textContent = '도서 목록을 불러오는 중 오류가 발생했습니다.';
      });
  }

  // 초기 로딩
  fetchAndDisplayBooks();

  // 등록·수정 처리
  bookForm.addEventListener('submit', event => {
    event.preventDefault();
    messageDiv.textContent = '';

    if (!titleInput.value.trim() || !isbnInput.value.trim()) {
      messageDiv.textContent = '제목과 ISBN은 필수 항목입니다.';
      return;
    }

    const bookData = {
      title:       titleInput.value.trim(),
      author:      authorInput.value.trim(),
      isbn:        isbnInput.value.trim(),
      price:       priceInput.value ? parseInt(priceInput.value, 10) : null,
      publishDate: publishDateInput.value || null
    };

    const id     = bookIdInput.value;
    const method = id ? 'PUT' : 'POST';
    const url    = id
      ? `${API_BASE}${API_PATH}/${id}`
      : `${API_BASE}${API_PATH}`;

    console.log('📡', method, url, bookData);
    fetch(url, {
      method,
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookData)
    })
      .then(response => {
        if (!response.ok) throw new Error(`status: ${response.status}`);
        return response.json();
      })
      .then(() => {
        bookForm.reset();
        bookIdInput.value = '';
        submitButton.textContent = '등록';
        fetchAndDisplayBooks();
      })
      .catch(err => {
        console.error(err);
        messageDiv.textContent = id
          ? '도서 수정 중 오류가 발생했습니다.'
          : '도서 등록 중 오류가 발생했습니다.';
      });
  });

  // 폼 리셋(취소) 처리
  bookForm.addEventListener('reset', () => {
    bookIdInput.value        = '';
    submitButton.textContent = '등록';
    messageDiv.textContent   = '';
  });

  // 수정/삭제 버튼 이벤트 위임
  document.getElementById('book-table').addEventListener('click', event => {
    const btn = event.target;
    if (btn.classList.contains('edit-btn')) {
      messageDiv.textContent = '';
      const tr    = btn.closest('tr');
      const cells = tr.querySelectorAll('td');
      bookIdInput.value      = btn.dataset.id;
      titleInput.value       = cells[1].textContent;
      authorInput.value      = cells[2].textContent;
      isbnInput.value        = cells[3].textContent;
      priceInput.value       = cells[4].textContent;
      publishDateInput.value = cells[5].textContent;
      submitButton.textContent = '수정';
      titleInput.focus();

    } else if (btn.classList.contains('delete-btn')) {
      if (!confirm('정말 삭제하시겠습니까?')) return;
      messageDiv.textContent = '';
      const deleteUrl = `${API_BASE}${API_PATH}/${btn.dataset.id}`;
      console.log('📡 DELETE', deleteUrl);
      fetch(deleteUrl, {
        method: 'DELETE',
        mode:   'cors'
      })
        .then(response => {
          if (!response.ok) throw new Error(`status: ${response.status}`);
          fetchAndDisplayBooks();
        })
        .catch(err => {
          console.error(err);
          messageDiv.textContent = '도서 삭제 중 오류가 발생했습니다.';
        });
    }
  });

});  
