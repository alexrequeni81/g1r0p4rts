async function fetchData() {
    try {
        const usersResponse = await fetch('http://localhost:3000/api/users');
        const users = await usersResponse.json();
        const usersDiv = document.getElementById('users');
        usersDiv.innerHTML = JSON.stringify(users, null, 2);

        const partsResponse = await fetch('http://localhost:3000/api/parts');
        const parts = await partsResponse.json();
        const partsDiv = document.getElementById('parts');
        partsDiv.innerHTML = JSON.stringify(parts, null, 2);
    } catch (error) {
        console.error('Error al obtener los datos:', error);
    }
}

fetchData();