document.addEventListener("DOMContentLoaded", () => {
    obtenerInformacionMedico();
    obtenerProximasConsultas();
    obtenerConsultasHoy();
});

function obtenerInformacionMedico() {
    fetch("../php/medico.php?action=info")
        .then(response => response.json())
        .then(data => {
            document.getElementById("nombreMedico").textContent = data.nombre;
            document.getElementById("especialidadMedico").textContent = data.especialidad;
        })
        .catch(error => console.error("Error al obtener la información del médico:", error));
}

function obtenerProximasConsultas() {
    fetch("../php/medico.php?action=proximasConsultas")
        .then(response => response.json())
        .then(data => {
            document.getElementById("nProximasConsultas").textContent = data.numeroConsultas;
        })
        .catch(error => console.error("Error al obtener las próximas consultas:", error));
}

function obtenerConsultasHoy() {
    fetch("../php/medico.php?action=consultasHoy")
        .then(response => response.json())
        .then(data => {
            const consultasHoy = document.getElementById("consultasHoy");
            consultasHoy.innerHTML = "";
            data.forEach(consulta => {
                const div = document.createElement("div");
                div.classList.add("contenido", "consulta");
                div.innerHTML = `
                    <p>ID: ${consulta.id}</p>
                    <p>Paciente: ${consulta.paciente}</p>
                    <p>Sintomatología: ${consulta.sintomas.substring(0, 100)}</p>
                    <button class="btn" onclick="pasarConsulta(${consulta.id})">Pasar consulta</button>
                `;
                consultasHoy.appendChild(div);
            });
        })
        .catch(error => console.error("Error al obtener las consultas de hoy:", error));
}

function pasarConsulta(idConsulta) {
    window.open(`consulta.html?id=${idConsulta}`, '_blank');
}