const logoutBtn = document.querySelector('.logout-btn');
logoutBtn.addEventListener('click', e => {
  fetch('/api/auth/logout', {
    method: 'POST',
  })
    .then(res => res.json())
    .then(result => {
      console.log(result);
      if (result.status) {
        window.location.href = '/reddit/login';
      }
    })
    .catch(err => console.log(err));
});
