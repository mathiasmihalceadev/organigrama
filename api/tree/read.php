<?php
// Headers
header( 'Access-Control-Allow-Origin: *' );
header( 'Content-type: application/json' );

include_once '../../config/Database.php';
include_once '../../models/Tree.php';

$database = new Database();
$db       = $database->connect();

$tree = new Tree( $db );

$result = $tree->get();
$num    = $result->rowCount();

if ( $num > 0 ) {
	$nodes_arr         = array();
	$nodes_arr['data'] = array();

	while ( $row = $result->fetch( PDO::FETCH_ASSOC ) ) {
		extract( $row );

		$node_item = array(
			'id'             => $id,
			'node_name'      => $node_name,
			'parent_node_id' => $parent_node_id,
			'username'       => $username
		);

		array_push( $nodes_arr['data'], $node_item );
	}

	echo json_encode( $nodes_arr );
} else {
	echo json_encode(
		array(
			'message' => 'No posts found.'
		)
	);
}