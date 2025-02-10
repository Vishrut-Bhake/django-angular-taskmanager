import { HttpClient, HttpHeaders } from '@angular/common/http';

const csrfToken = document.cookie.split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];  // ✅ Extract CSRF token from cookies

const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'X-CSRFToken': csrfToken || ''  // ✅ Add CSRF token
});
