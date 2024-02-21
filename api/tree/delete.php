<?php
// Headers
header( 'Access-Control-Allow-Origin: *' );
header( 'Content-type: application/json' );
header( 'Access-Control-Allow-Methods: DELETE' );
header( 'Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-type, Access-Control-Allow-Methods, Authorization, X-Requested-With' );


include_once '../../config/Database.php';
include_once '../../models/Tree.php';

$database = new Database();
$db       = $database->connect();

$tree = new Tree( $db );

$data = json_decode( file_get_contents( "php://input" ) );

$tree->node_id         = $data->node_id;
$tree->delete_children = $data->delete_children;
$tree->parent_node_id  = $data->parent_node_id;


if ( $tree->delete() ) {
	echo json_encode(
		array(
			'message' => 'Node Deleted.',
		) );
} else {
	echo json_encode(
		array( 'message' => 'Node not deleted.' )
	);
}
