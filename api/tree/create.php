<?php
// Headers
header( 'Access-Control-Allow-Origin: *' );
header( 'Content-type: application/json' );
header( 'Access-Control-Allow-Methods: POST' );
header( 'Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-type, Access-Control-Allow-Methods, Authorization, X-Requested-With' );


include_once '../../config/Database.php';
include_once '../../models/Tree.php';

$database = new Database();
$db       = $database->connect();

$tree = new Tree( $db );

$data = json_decode( file_get_contents( "php://input" ) );

$tree->node_name         = $data->node_name;
$tree->node_id           = $data->node_id;
$tree->username          = $data->username;
$tree->where_to_add_node = $data->where_to_add_node;


if ( $tree->create() ) {
	$new_node_id = $tree->getLastInsertId();
	echo json_encode(
		array(
			'message'     => 'Node Created.',
			'new_node_id' => $new_node_id
		) );

} else {
	echo json_encode(
		array( 'message' => 'Node not created.' )
	);
}