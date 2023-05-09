document.addEventListener("DOMContentLoaded", function () {
	// Use buttons to toggle between views
	document
		.querySelector("#inbox")
		.addEventListener("click", () => load_mailbox("inbox"));
	document
		.querySelector("#sent")
		.addEventListener("click", () => load_mailbox("sent"));
	document
		.querySelector("#archived")
		.addEventListener("click", () => load_mailbox("archive"));
	document
		.querySelector("#compose")
		.addEventListener("click", () => compose_email());

	//submit email event
	document
		.querySelector("#compose-form")
		.addEventListener("submit", send_email);
	
	

	// By default, load the inbox
	load_mailbox("inbox");
});

function compose_email() {
	// Show compose view and hide other views
	document.querySelector("#emails-view").style.display = "none";
	document.querySelector("#compose-view").style.display = "block";
	document.querySelector("#email-view").style.display = "none";

	// Clear out composition fields
	document.querySelector("#compose-recipients").value = "";
	document.querySelector("#compose-subject").value = "";
	document.querySelector("#compose-body").value = "";
}

function load_mailbox(mailbox) {
	// Show the mailbox and hide other views
	document.querySelector("#emails-view").style.display = "block";
	document.querySelector("#compose-view").style.display = "none";
	document.querySelector("#email-view").style.display = "none";

	// Show the mailbox name
	document.querySelector("#emails-view").innerHTML = `<h3>${
		mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
	}</h3>`;

	//get mailbox
	fetch(`/emails/${mailbox}`)
		.then((response) => response.json())
		.then((emails) => {
			console.log(emails);
		//list all emails
		emails.forEach(email => {
			const sender = email.sender
			const subject = email.subject
			const timestamp = email.timestamp

			//html and css formating for each email 
			div = document.createElement('div');
			background_color = email.read ? 'bg-light' : 'bg-white';
			div.classList.add('border', 'p-2', 'd-flex', background_color, 'my-2');
			

			const email_sender = document.createElement('h5');
			email_sender.innerHTML =`${sender}`
			div.appendChild(email_sender)

			const email_subject = document.createElement('p');
			email_subject.innerHTML=`${subject}`
			email_subject.classList.add('ml-4');
			div.appendChild(email_subject)
			
			const email_timestamp = document.createElement('p');
			email_timestamp.innerHTML=`${timestamp}`
			email_timestamp.classList.add('text-muted', 'ml-auto');
			div.appendChild(email_timestamp)
			
			document.querySelector('#emails-view').append(div);	

			div.addEventListener("click", () => {
				load_email(email,mailbox)
			})
		})
			
		})
	
	
}

function send_email(event) {
	event.preventDefault();

	//get content wrote by the user
	const recipients = document.querySelector("#compose-recipients").value;
	const subject = document.querySelector("#compose-subject").value;
	const body = document.querySelector("#compose-body").value;

	//send a POST request to the API route
	fetch("/emails", {
		method: "POST",
		body: JSON.stringify({
			recipients: recipients,
			subject: subject,
			body: body,
		}),
	})
		.then((response) => response.json())
		.then((result) => {
			console.log(result);
			load_mailbox("sent");
		});
}

function load_email(email) {
	// Show the selected email view and hide others
	document.querySelector("#emails-view").style.display = "none";
	document.querySelector("#compose-view").style.display = "none";
	document.querySelector("#email-view").style.display = "block";

	

	const email_view = document.querySelector("#email-view");
	//get the email id and create html for the content of the email
	fetch(`/emails/${email.id}`)
	.then(response => response.json())
	.then(email => {
		email_view.innerHTML = `
		<div><strong>From: </strong>${email.sender}<div>
		<div><strong>To: </strong>${email.recipients}<div>
		<div><strong>Subject: </strong>${email.subject}<div>
		<div style="color:grey">${email.timestamp}<div>
		<button class="btn btn-sm btn-outline-primary" id="reply" onclick="reply(${email.id})">Reply</button>
		<button class="btn btn-sm btn-outline-primary" id="archive" onclick="archive(${email.id}, ${email.archived})">Archive</button>
		<hr>
		<div style="color:black">${email.body}<div>
		`
		//if the user logged in is the same as the email sender, disable the archive button
		if (document.querySelector("#user-email").innerHTML === email.sender) {
			archive_button = document.querySelector("#archive");
			archive_button.remove()
		  }
		  // if the email is archived, change html text of the archive button
		  if (email.archived) {
			document.querySelector("#archive").innerHTML="Unarchive"
		  }
	})
	
	//mark "read" object as true
	fetch(`/emails/${email.id}`, {
		method: 'PUT',
		body: JSON.stringify({
			read: true
		})
	  })

	  
}

function reply(id) {

	//get the email id
	fetch(`/emails/${id}`)
	.then(response => response.json())
	.then (email => {
		compose_email();
		
		//check if the email was already responded. If not, add "Re: " to the beginning of subject 
		const is_responded = email.subject.slice(0,2) ===  "Re" ? "" : "Re: ";

	document.querySelector("#compose-recipients").value = `${email.sender}`;
	document.querySelector("#compose-subject").value = is_responded + email.subject;
	document.querySelector("#compose-body").value = `On ${email.timestamp} ${email.sender} wrote: "${email.body}"->`;
	})
}

function archive(id, archived) {

	//get the email id and 
	fetch(`/emails/${id}`, {
		method: 'PUT',
		body: JSON.stringify({
			archived: !archived
		})
	  })
	  //load archive mailbox view
	  .then(result => {
		load_mailbox("archive");
	  })

}
