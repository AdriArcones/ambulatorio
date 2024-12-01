<?php
include_once 'conecta.php';

$action = $_GET['action'];

switch ($action) {
    case 'info':
        $idConsulta = $_GET['id'];
        obtenerInformacionConsulta($idConsulta);
        break;
    case 'medicamentos':
        obtenerMedicamentos();
        break;
    case 'especialistas':
        obtenerEspecialistas();
        break;
    case 'derivar':
        $data = json_decode(file_get_contents("php://input"), true);
        derivarEspecialista($data);
        break;
    case 'registrar':
        $data = json_decode(file_get_contents("php://input"), true);
        registrarConsulta($data);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Acción no válida']);
}

function obtenerInformacionConsulta($idConsulta) {
    global $conexion;
    $sql = "SELECT cita.*, medico.nombre AS medico, paciente.nombre AS paciente 
            FROM cita 
            JOIN medico ON cita.id_medico = medico.id 
            JOIN paciente ON cita.id_paciente = paciente.id 
            WHERE cita.id = $idConsulta";
    $result = $conexion->query($sql);
    $data = $result->fetch_assoc();
    echo json_encode($data);
}

function obtenerMedicamentos() {
    global $conexion;
    $sql = "SELECT id, nombre FROM medicamento";
    $result = $conexion->query($sql);
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode($data);
}

function obtenerEspecialistas() {
    global $conexion;
    $sql = "SELECT id, nombre, especialidad FROM medico";
    $result = $conexion->query($sql);
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode($data);
}

function derivarEspecialista($data) {
    global $conexion;
    $especialista = $data['especialista'];
    $fecha = $data['fecha'];
    $idPaciente = $data['idPaciente'];

    $sql = "INSERT INTO cita (id_paciente, id_medico, fecha) VALUES (?, ?, ?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("iis", $idPaciente, $especialista, $fecha);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al derivar al especialista']);
    }

    $stmt->close();
}

function registrarConsulta($data) {
    global $conexion;
    $idConsulta = $data['idConsulta'];
    $sintomas = $data['sintomas'];
    $diagnostico = $data['diagnostico'];
    $medicacion = json_encode($data['medicacion']);

    $sql = "UPDATE cita SET sintomas = ?, diagnostico = ?, medicacion = ? WHERE id = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("sssi", $sintomas, $diagnostico, $medicacion, $idConsulta);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al registrar la consulta']);
    }

    $stmt->close();
}

$conexion->close();
?>