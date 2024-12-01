document.addEventListener("DOMContentLoaded", () => {
    obtenerInformacionPaciente();
    obtenerProximasCitas();
    obtenerMedicacionActual();
    obtenerConsultasPasadas();
    configurarFormularioCita();
});

function obtenerInformacionPaciente() {
    fetch("../php/paciente.php?action=info")
        .then(response => response.json())
        .then(data => {
            document.getElementById("nombrePaciente").textContent = data.nombre;
            document.getElementById("infoPaciente").textContent = data.informacion;
        })
        .catch(error => console.error("Error al obtener la información del paciente:", error));
}

function obtenerProximasCitas() {
    fetch("../php/paciente.php?action=proximasCitas")
        .then(response => response.json())
        .then(data => {
            const listaCitas = document.getElementById("listaCitas");
            listaCitas.innerHTML = "";
            data.forEach(cita => {
                const li = document.createElement("li");
                li.textContent = `ID: ${cita.id}, Médico: ${cita.medico}, Fecha: ${cita.fecha}`;
                listaCitas.appendChild(li);
            });
        })
        .catch(error => console.error("Error al obtener las próximas citas:", error));
}

function obtenerMedicacionActual() {
    fetch("../php/paciente.php?action=medicacionActual")
        .then(response => response.json())
        .then(data => {
            const listaMedicacion = document.getElementById("listaMedicacion");
            listaMedicacion.innerHTML = "";
            data.forEach(medicacion => {
                const li = document.createElement("li");
                li.textContent = `${medicacion.nombre}, Posología: ${medicacion.posologia}, Hasta: ${medicacion.hasta}`;
                listaMedicacion.appendChild(li);
            });
        })
        .catch(error => console.error("Error al obtener la medicación actual:", error));
}

function obtenerConsultasPasadas() {
    fetch("../php/paciente.php?action=consultasPasadas")
        .then(response => response.json())
        .then(data => {
            console.log("Consultas pasadas:", data); // Agregar este log para verificar los datos
            const listaConsultas = document.getElementById("listaConsultas");
            listaConsultas.innerHTML = "";
            data.forEach(consulta => {
                const li = document.createElement("li");
                li.textContent = `ID: ${consulta.id}, Fecha: ${consulta.fecha}`;
                li.addEventListener("click", () => mostrarDetalleConsulta(consulta.id));
                listaConsultas.appendChild(li);
            });
        })
        .catch(error => console.error("Error al obtener las consultas pasadas:", error));
}

function mostrarDetalleConsulta(idConsulta) {
    fetch(`../php/paciente.php?action=detalleConsulta&id=${idConsulta}`)
        .then(response => response.json())
        .then(data => {
            // Mostrar la información detallada de la consulta
            alert(`Detalles de la consulta: ${JSON.stringify(data)}`);
        })
        .catch(error => console.error("Error al obtener los detalles de la consulta:", error));
}

function configurarFormularioCita() {
    const formCita = document.getElementById("formCita");
    const fechaInput = document.getElementById("fecha");
    const mensajeError = document.createElement("span");
    formCita.appendChild(mensajeError);

    // Obtener médicos disponibles
    fetch("../php/paciente.php?action=medicosDisponibles")
        .then(response => response.json())
        .then(data => {
            const selectMedico = document.getElementById("medico");
            selectMedico.innerHTML = "";
            data.forEach(medico => {
                const option = document.createElement("option");
                option.value = medico.id;
                option.textContent = `${medico.nombre} (${medico.especialidad})`;
                selectMedico.appendChild(option);
            });
        })
        .catch(error => console.error("Error al obtener los médicos disponibles:", error));

    fechaInput.addEventListener("change", () => {
        const fechaSeleccionada = new Date(fechaInput.value);
        const hoy = new Date();
        const unMesDespues = new Date(hoy);
        unMesDespues.setMonth(hoy.getMonth() + 1);

        if (fechaSeleccionada < hoy) {
            mensajeError.textContent = "Fecha no válida";
        } else if (fechaSeleccionada.getDay() === 0 || fechaSeleccionada.getDay() === 6) {
            mensajeError.textContent = "Por favor, elija un día laborable";
        } else if (fechaSeleccionada > unMesDespues) {
            mensajeError.textContent = "Tan malo no estarás. Pide una fecha como máximo 30 días en el futuro";
        } else {
            mensajeError.textContent = "";
        }
    });

    formCita.addEventListener("submit", (event) => {
        event.preventDefault();
        if (mensajeError.textContent === "") {
            const medico = document.getElementById("medico").value;
            const fecha = fechaInput.value;
            const sintomas = document.getElementById("sintomas").value;

            fetch("../php/paciente.php?action=pedirCita", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ medico, fecha, sintomas })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Cita pedida correctamente");
                    obtenerProximasCitas();
                } else {
                    alert("Error al pedir la cita: " + data.message);
                }
            })
            .catch(error => console.error("Error al pedir la cita:", error));
        }
    });
}
