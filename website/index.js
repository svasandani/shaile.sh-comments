let authForm = document.querySelector('#authModal form');
let input = document.querySelector("#userKey");
let authModal;
let infoModal;

let apiKey = "";
let commentData = {};

const getCommentById = (id) => {
  return commentData.find(el => el._id === id);
}

const buildComment = (data) => {
  return `
<tr>
  <td>${data.title}</td>
  <td class="button-col">
    <div class="input-group">
      <button type="button" class="btn btn-primary modal-button" data-id="${data._id}" data-bs-toggle="modal" data-bs-target="#infoModal">Show comment</button>
    </div>
  </td>
</tr>
  `
}

const handlePublish = (e, el) => {
  if (!confirm('Are you sure?')) return;
  fetch('/' + el.dataset.action, {
    method: 'PUT',
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id: el.dataset.id })
  })
  .then(() => { updateData(); infoModal.hide(); })
}

const handleEdit = (e, el) => {
  if (!confirm('Are you sure?')) return;

  const body = {};

  let comment = getCommentById(el.dataset.id);

  Object.keys(comment).forEach(key => {
    if (key === "published") return;
    else if (key === "_id") body["id"] = comment[key];
    else {
      body[key] = document.querySelector(`#comment-${key}`).value;
    }
  });

  console.log(body);

  fetch('/comment', {
    method: 'PUT',
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  .then(() => { updateData(); infoModal.hide(); })
}

const handleDelete = (e, el) => {
  if (!confirm('Are you sure?')) return;
  fetch('/comment', {
    method: 'DELETE',
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id: el.dataset.id })
  })
    .then(() => { updateData(); infoModal.hide(); })
}

const populateTable = (tableEl, tableData) => {
  Array.from(tableEl.children).forEach(el => {
    if (el.nodeName === "TBODY") tableEl.removeChild(el);
  });

  let tbody = document.createElement('TBODY');

  tableData.forEach(data => {
    tbody.insertAdjacentHTML('beforeEnd', buildComment(data));
  });
  
  tableEl.appendChild(tbody);

  let infoModalEl = document.getElementById('infoModal');

  infoModalEl.addEventListener('show.bs.modal', (e) => {
    // Button that triggered the modal
    let button = e.relatedTarget

    let comment = getCommentById(button.dataset.id);

    let editbtn = infoModalEl.querySelector(".edit-button");
    editbtn.onclick = (e) => { handleEdit(e, editbtn) };
    
    let pubbtn = infoModalEl.querySelector(".pub-button");
    pubbtn.onclick = (e) => { handlePublish(e, pubbtn) };

    let delbtn = infoModalEl.querySelector(".del-button");
    delbtn.onclick = (e) => { handleDelete(e, delbtn) };
    
    Object.keys(comment).forEach(key => {
      if (key === "published") {
        if (comment[key]) {
          pubbtn.dataset.action = 'unpublish';
          pubbtn.textContent = 'Unpublish';
        } else {
          pubbtn.dataset.action = 'publish';
          pubbtn.textContent = 'Publish';
        }
      } else if (key === "_id") {
        Array.from(infoModalEl.querySelectorAll('.action-button')).forEach(button => button.dataset.id = comment[key]);
      } else {
        infoModalEl.querySelector(`#comment-${key}`).value = comment[key];
      }
    });
  });
}

const populateTables = () => {
  const pub = [];

  const unpub = commentData.reduce((acc, curr) => {
    if (curr.published) {
      pub.push(curr);
    }
    else acc.push(curr);
    return acc;
  }, []);

  let unpubEl = document.querySelector('#unpublished');
  let pubEl = document.querySelector('#published');

  populateTable(unpubEl, unpub);
  populateTable(pubEl, pub);
}

const updateData = () => {
  fetch('/comments', {
    headers: {
      'Authorization': apiKey
    }
  })
    .then(response => {
      if (response.status != 200) throw new Error('Something went wrong...');
      else return response.json()
    })
    .then(data => {
      commentData = data;
      populateTables();
    })
}

authForm.addEventListener('submit', (e) => {
  e.preventDefault();

  let key = input.value;

  fetch('/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ key })
  })
    .then(response => {
      if (response.status != 200) throw new Error('Something went wrong...');
      else return response.json()
    })
    .then(data => {
      if (input.classList.contains('is-invalid')) input.classList.remove('is-invalid');
      apiKey = data.api_key;
      updateData();
      authModal = bootstrap.Modal.getInstance(document.querySelector('#authModal'));
      infoModal = new bootstrap.Modal(document.querySelector('#infoModal'));
      authModal.hide();
    })
    .catch(err => {
      console.error(err);
      input.classList.add('is-invalid');
    })
}, false)