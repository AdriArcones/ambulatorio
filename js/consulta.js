document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const idConsulta = urlParams.get('id');
    obtenerInformacionConsulta(idConsulta);
    configurarFormularioMedicacion();
    configurarFormularioEspecialista();
    document.getElementById("btnRegistrar").addEventListener("click", () => registrarConsulta(idConsulta));
});

function obtenerInformacionConsulta(idConsulta) {
    fetch(`../php/consulta.php?action=info&id=${idConsulta}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("nombreMedico").textContent = data.medico;
            document.getElementById("nombrePaciente").textContent = data.paciente;
            document.getElementById("fechaConsulta").textContent = data.fecha;
            document.getElementById("sintomas").value = data.sintomas;
            document.getElementById("diagnostico").value = data.diagnostico;
        })
        .catch(error => console.error("Error al obtener la información de la consulta:", error));
}

function configurarFormularioMedicacion() {
    fetch("../php/consulta.php?action=medicamentos")
        .then(response => response.json())
        .then(data => {
            const selectMedicamento = document.getElementById("medicamento");
            selectMedicamento.innerHTML = "";
            data.forEach(medicamento => {
                const option = document.createElement("option");
                option.value = medicamento.id;
                option.textContent = medicamento.nombre;
                selectMedicamento.appendChild(option);
            });
        })
        .catch(error => console.error("Error al obtener los medicamentos:", error));

    document.getElementById("btnAddMedicacion").addEventListener("click", () => {
        const medicamento = document.getElementById("medicamento").value;
        const cantidad = document.getElementById("cantidad").value;
        const frecuencia = document.getElementById("frecuencia").value;
        const duracion = document.getElementById("duracion").value;
        const cronica = document.getElementById("cronica").checked;

        if (medicamento && cantidad && frecuencia && (cronica || duracion)) {
            const li = document.createElement("li");
            li.textContent = `${medicamento}: ${cantidad}, ${frecuencia}, ${cronica ? 'Crónica' : duracion + ' días'}`;
            document.getElementById("listaMedicacion").appendChild(li);
        } else {
            alert("Por favor, complete todos los campos requeridos.");
        }
    });
}

function configurarFormularioEspecialista() {
    fetch("../php/consulta.php?action=especialistas")
        .then(response => response.json())
        .then(data => {
            const selectEspecialista = document.getElementById("especialista");
            selectEspecialista.innerHTML = "";
            data.forEach(especialista => {
                const option = document.createElement("option");
                option.value = especialista.id;
                option.textContent = `${especialista.nombre} (${especialista.especialidad})`;
                selectEspecialista.appendChild(option);
            });
        })
        .catch(error => console.error("Error al obtener los especialistas:", error));

    document.getElementById("btnAddCita").addEventListener("click", () => {
        const especialista = document.getElementById("especialista").value;
        const fecha = document.getElementById("fechaEspecialista").value;

        if (especialista && fecha) {
            fetch("../php/consulta.php?action=derivar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ especialista, fecha })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Cita con especialista añadida correctamente");
                } else {
                    alert("Error al añadir la cita con el especialista: " + data.message);
                }
            })
            .catch(error => console.error("Error al añadir la cita con el especialista:", error));
        } else {
            alert("Por favor, complete todos los campos requeridos.");
        }
    });
}

function registrarConsulta(idConsulta) {
    const sintomas = document.getElementById("sintomas").value;
    const diagnostico = document.getElementById("diagnostico").value;
    const medicacion = Array.from(document.getElementById("listaMedicacion").children).map(li => li.textContent);

    fetch("../php/consulta.php?action=registrar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ idConsulta, sintomas, diagnostico, medicacion })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Consulta registrada correctamente");
        } else {
            alert("Error al registrar la consulta: " + data.message);
        }
    })
    .catch(error => console.error("Error al registrar la consulta:", error));
}