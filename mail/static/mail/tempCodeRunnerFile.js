function load_email(email) {
	// Show the selected email view and hide others
	document.querySelector("#emails-view").style.display = "none";
	document.querySelector("#compose-view").style.display = "none";
	document.querySelector("#email-view").style.display = "block";

	

	const email_view = document.querySelector("#email-view");

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
	})
	const aaa = email.sender
	if (document.querySelector("#user-email").innerHTML === email.sender) {
		archive_button = document.querySelector("#archive");
		archive_button.remove()
	  }
	
	//mark "read" object as true
	fetch(`/emails/${email.id}`, {
		method: 'PUT',
		body: JSON.stringify({
			read: true
		})
	  })

	  
}
