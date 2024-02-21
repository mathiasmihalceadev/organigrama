<?php
header( 'Access-Control-Allow-Origin: *' );
header( 'Content-type: application/json' );
header( 'Access-Control-Allow-Methods: PUT' );
header( 'Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-type, Access-Control-Allow-Methods, Authorization, X-Requested-With' );

include_once '../../config/Database.php';
include_once '../../models/Tree.php';

$database = new Database();
$db       = $database->connect();

$tree = new Tree( $db );

$data = json_decode( file_get_contents( "php://input" ) );

$tree->node_id            = $data->node_id;
$tree->new_parent_node_id = $data->new_parent_node_id;
$tree->move_children      = $data->move_children;
$tree->parent_node_id     = $data->parent_node_id;

if ( $tree->update() ) {
	echo json_encode(
		array(
			'message' => 'Node Updated.',
		) );
} else {
	echo json_encode(
		array( 'message' => 'Node not updates.' )
	);
}