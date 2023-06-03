export async function getAccessToken(client_id, client_secret, redirect_url, code) {
	let post = 'client_id=' + client_id + 
				'&redirect_uri=' + redirect_url + 
				'&client_secret=' + client_secret + 
				'&code=' + code + 
				'&grant_type=authorization_code';

	let response = await fetch('https://www.googleapis.com/oauth2/v4/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: post
	});

	if(response.status != 200)
		throw new Error('Error : Failed to receieve access token'); 

	let json_response = await response.json();
	let access_token = json_response['access_token'];

	return access_token;
}

export async function getProfileInfo(access_token) {
	let response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo?fields=name,email,id,picture,verified_email', {
		method: 'GET',
		headers: {
			'Authorization': 'Bearer ' + access_token
		}
	});

	if(response.status != 200)
		throw new Error('Error : Failed to get user information'); 

	let json_response = await response.json();

	return json_response;
}