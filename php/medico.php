<?php
include_once 'conecta.php';

$action = $_GET['action'];

switch ($action) {
    case 'info':
        obtenerInformacionMedico();
        break;
    case 'proximasConsultas':
        obtenerProximasConsultas();
        break;
    case 'consultasHoy':
        obtenerConsultasHoy();
        break;
    case 'detalleConsulta':
        $idConsulta = $_GET['id'];
        obtenerDetalleConsulta($idConsulta);
        break;
    case 'editarConsulta':
        $data = json_decode(file_get_contents("php://input"), true);
        editarConsulta($data);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Acción no válida']);
}

function obtenerInformacionMedico() {
    global $conexion;
    $dni = '12345678B'; // Aquí deberías obtener el DNI del médico autenticado
    $sql = "SELECT nombre, especialidad FROM medico WHERE dni = '$dni'";
    $result = $conexion->query($sql);
    $data = $result->fetch_assoc();
    echo json_encode($data);
}

function obtenerProximasConsultas() {
    global $conexion;
    $dni = '12345678B'; // Aquí deberías obtener el DNI del médico autenticado
    $sql = "SELECT COUNT(*) AS numeroConsultas 
            FROM cita 
            JOIN medico ON cita.id_medico = medico.id 
            WHERE medico.dni = '$dni' AND cita.fecha BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)";
    $result = $conexion->query($sql);
    $data = $result->fetch_assoc();
    echo json_encode($data);
}

function obtenerConsultasHoy() {
    global $conexion;
    $dni = '12345678B'; // Aquí deberías obtener el DNI del médico autenticado
    $sql = "SELECT cita.id, paciente.nombre AS paciente, cita.sintomas 
            FROM cita 
            JOIN medico ON cita.id_medico = medico.id 
            JOIN paciente ON cita.id_paciente = paciente.id 
            WHERE medico.dni = '$dni' AND cita.fecha = CURDATE()";
    $result = $conexion->query($sql);
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode($data);
}

function obtenerDetalleConsulta($idConsulta) {
    global $conexion;
    $sql = "SELECT cita.*, paciente.nombre AS paciente, paciente.informacion 
            FROM cita 
            JOIN paciente ON cita.id_paciente = paciente.id 
            WHERE cita.id = $idConsulta";
    $result = $conexion->query($sql);
    $data = $result->fetch_assoc();
    echo json_encode($data);
}

function editarConsulta($data) {
    global $conexion;
    $idConsulta = $data['idConsulta'];
    $sintomas = $data['sintomas'];
    $diagnostico = $data['diagnostico'];
    $sql = "UPDATE cita SET sintomas = ?, diagnostico = ? WHERE id = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ssi", $sintomas, $diagnostico, $idConsulta);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al editar la consulta']);
    }

    $stmt->close();
}

$conexion->close();
?>