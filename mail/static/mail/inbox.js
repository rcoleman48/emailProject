document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);  
  
  // By default, load the inbox
        load_mailbox('inbox');
});

function clearBox(elementID)
{
    document.getElementById(elementID).innerHTML = "";
}

document.addEventListener('click', event => {
    const element = event.target;
    if (element.id == 'reply') {
        reply(element.parentElement.id)
    }
    if (element.id == 'archive') {
        archive(element.parentElement.id)
        load_mailbox('inbox');
    }
    if (element.id == 'unarchive') {
        unarchive(element.parentElement.id)
        load_mailbox('archive');
    }
    if (element.id == 'send') {
    console.log("what the fuck");
    const recips = document.getElementById('compose-recipients').value;
    const sub = document.getElementById('compose-subject').value;
    const bod = document.getElementById('compose-body').value;  
    console.log(bod);
    sendEmail(recips, sub, bod);
  }
    

})


function compose_email() {
  var element = document.getElementById("SendEmail");
    if (element != null) {
    element.parentNode.removeChild(element);
    }
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  const mail =document.createElement('div');
  mail.innerHTML += "<button class=\"btn btn-sm btn-outline-primary\" id=\"send\">Send </button>"
  mail.setAttribute("id","SendEmail");
  document.querySelector('#compose-view').append(mail);
}


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
    clearBox("emails-view");

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  if(mailbox == 'inbox'){
    fetch('emails/inbox')
    .then(response => response.json())
    .then(emails => {
        emails.forEach(load_emails);
    })
  }
  else if(mailbox == 'archive'){
  
    fetch('emails/archive')
    .then(response => response.json())
    .then(emails => {
        emails.forEach(load_emails);
    })
  }
  else if(mailbox == 'sent'){
  
    fetch('emails/sent')
    .then(response => response.json())
    .then(emails => {
        emails.forEach(load_emails);
    })
  }
  
}

function load_emails(email) {
    const post =document.createElement('div');
    post.className = 'post';
    if(email.read == true){
        post.id = "read";
    }
    else {
        post.id = "unread";
    }
    
    post.innerHTML = "<h2>" + email.sender + "</h2>";
    post.innerHTML += "<h3>" + email.subject + "</h3>";
    post.innerHTML += "<h4> <i>" + email.timestamp + "</i> </h4>";
    post.addEventListener('click', function() {
        open_email(email)
    });
    
    document.querySelector('#emails-view').append(post);

}

function open_email(email) {
    clearBox("email-view");
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    console.log(email)
    
    const mail =document.createElement('div');
    mail.id = email.id
    mail.className = 'mail';
    mail.innerHTML = "<h2>" + email.subject + "</h2>";
    mail.innerHTML += "<h3> From: " + email.sender + "</h3>";
    mail.innerHTML += "<p>" + email.body + "<p>";
    mail.innerHTML += "<p> <i> Sent at:" + email.timestamp + "</i> </p>"
    mail.innerHTML += "<button class=\"btn btn-sm btn-outline-primary\" id=\"reply\">Reply </button>"
    if(email.archived == false) {
    mail.innerHTML += "<button class=\"btn btn-sm btn-outline-primary\" id=\"archive\">Archive</button>"
    }
    else {
    mail.innerHTML += "<button class=\"btn btn-sm btn-outline-primary\" id=\"unarchive\">Unarchive</button>"
    }
    
    document.querySelector('#email-view').append(mail);
    
    fetch('/emails/' + email.id, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
    })

}

function reply(email_id) {
  var element = document.getElementById("SendEmail");
  if (element != null) {
    element.parentNode.removeChild(element);
    }
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  fetch('/emails/'+email_id)
.then(response => response.json())
.then(email => {
    // Print email
document.querySelector('#compose-recipients').value = email.sender;
  document.querySelector('#compose-subject').value = 'Re: ' + email.subject;
  document.querySelector('#compose-body').value = 'On ' + email.timestamp + ' ' + email.sender + ' wrote: ' + email.body;
  
const mail =document.createElement('div');
  mail.innerHTML += "<button class=\"btn btn-sm btn-outline-primary\" id=\"send\">Send </button>"
  mail.setAttribute("id","SendEmail");
  document.querySelector('#compose-view').append(mail);
    // ... do something else with email ...
});
}

function archive(email_id) {
fetch('/emails/' + email_id, {
  method: 'PUT',
  body: JSON.stringify({
      archived: true
  })
});

}

function unarchive(email_id) {
fetch('/emails/' + email_id, {
  method: 'PUT',
  body: JSON.stringify({
      archived: false
  })
});
}


function sendEmail(recips, sub, bod) {
console.log("Sending");
fetch('/emails', {
  method: 'POST',
  body: JSON.stringify({
      recipients: recips,
      subject: sub,
      body: bod
  })
})
.then(response => response.json())
.then(result => {
    // Print result
    console.log(result);
    load_mailbox('sent');   
    console.log("Sent");
});
}
