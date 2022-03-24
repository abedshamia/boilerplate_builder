const signUpForm = document.getElementById('sign-up');
const signUpBtn = document.querySelector('.sign-up-btn');

const loginForm = document.getElementById('login');
const loginBtn = document.querySelector('.login-btn');

const rmCheck = document.getElementById('remember');
const usernameInput = loginForm.querySelector('input[name="username"]');
const passwordInput = loginForm.querySelector('input[name="password"]');

if (localStorage.checkbox && localStorage.checkbox !== '') {
  rmCheck.setAttribute('checked', 'checked');
  usernameInput.value = localStorage.username;
  passwordInput.value = localStorage.password;
} else {
  rmCheck.removeAttribute('checked');
  usernameInput.value = '';
  passwordInput.value = '';
}

function isRememberMe() {
  if (rmCheck.checked && usernameInput.value !== '') {
    localStorage.username = usernameInput.value;
    localStorage.password = passwordInput.value;
    localStorage.checkbox = rmCheck.value;
  } else {
    localStorage.username = '';
    localStorage.password = '';
    localStorage.checkbox = '';
  }
}

signUpBtn.addEventListener('click', e => {
  const username = signUpForm.querySelector('[name=username]');
  const password = signUpForm.querySelector('[name=password]');
  const passwordConfirm = signUpForm.querySelector('[name=confirm_password]');
  const email = signUpForm.querySelector('[name=email]');

  const usernameValue = username.value;
  const passwordValue = password.value;
  const passwordConfirmValue = passwordConfirm.value;
  const emailValue = email.value;

  const errorMessages = [];

  if (
    !usernameValue.trim() ||
    !passwordValue.trim() ||
    !passwordConfirmValue.trim() ||
    !emailValue.trim()
  ) {
    errorMessages.push('All fields are required');
  }

  if (usernameValue.includes(' ')) {
    errorMessages.push('Username cannot contain spaces');
  }

  if (!passwordValue.match(/^[a-zA-Z0-9]{3,30}$/)) {
    errorMessages.push(
      'Password must be between 3 and 30 characters and contain only letters and numbers'
    );
  }

  if (passwordValue.trim() !== passwordConfirmValue.trim()) {
    errorMessages.push('Passwords do not match');
  }

  if (emailValue.includes(' ') || !emailValue.includes('@')) {
    errorMessages.push('Email is invalid');
  }

  if (errorMessages.length > 0) {
    e.preventDefault();

    createError(signUpForm, errorMessages);
  } else {
    e.preventDefault();
    const user = {
      username: usernameValue,
      password: passwordValue,
      email: emailValue,
    };
    fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        if (data.status === 'success') {
          window.location.href = '/';
        } else {
          createError(signUpForm, data.message);
        }
      })
      .catch(err => console.log(err));
  }
});

loginBtn.addEventListener('click', e => {
  const username = loginForm.querySelector('[name=username]');
  const password = loginForm.querySelector('[name=password]');

  const usernameValue = username.value;
  const passwordValue = password.value;

  const errorMessages = [];

  if (!usernameValue.trim() || !passwordValue.trim()) {
    errorMessages.push('All fields are required');
  }

  if (!passwordValue.match(/^[a-zA-Z0-9]{3,30}$/)) {
    errorMessages.push(
      'Password must be between 3 and 30 characters and contain only letters and numbers'
    );
  }

  if (errorMessages.length > 0) {
    e.preventDefault();
    createError(loginForm, errorMessages);
  } else {
    e.preventDefault();
    const user = {
      username: usernameValue,
      password: passwordValue,
    };
    fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    })
      .then(res => res.json())
      .then(data => {
        if (rmCheck.checked) {
          isRememberMe();
        }
        console.log(data);
        if (data.status === 'success') {
          window.location.href = '/';
        } else {
          createError(loginForm, data.message);
        }
      })
      .catch(err => console.log(err));
  }
});

function createError(form, messages) {
  form.querySelector('.error-container')
    ? form.querySelector('.error-container').remove()
    : null;
  const errorList = document.createElement('ul');
  errorList.className = 'error-container';
  form.appendChild(errorList);
  Array.isArray(messages) ? null : (messages = [messages]);
  messages.forEach(message => {
    const errorItem = document.createElement('li');
    errorItem.innerText = message;
    errorItem.classList.add('error-item');
    errorList.appendChild(errorItem);
  });
}
