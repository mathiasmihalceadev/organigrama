<?php

class Tree {
	private $conn;
	private $table = 'nodes';

	public $node_id;
	public $parent_node_id;
	public $node_name;
	public $username;
	public $where_to_add_node;
	public $delete_children;
	public $new_parent_node_id;
	public $move_children;

	public function __construct( $db ) {
		$this->conn = $db;
	}

	//Returns the ID of the last inserted row
	public function getLastInsertId() {
		return $this->conn->lastInsertID();
	}

	//Sanitizes the data
	public function sanitizeData() {
		$this->node_name          = htmlspecialchars( strip_tags( $this->node_name ) );
		$this->parent_node_id     = htmlspecialchars( strip_tags( $this->parent_node_id ) );
		$this->node_id            = htmlspecialchars( strip_tags( $this->node_id ) );
		$this->username           = htmlspecialchars( strip_tags( $this->username ) );
		$this->where_to_add_node  = htmlspecialchars( strip_tags( $this->where_to_add_node ) );
		$this->delete_children    = htmlspecialchars( strip_tags( $this->delete_children ) );
		$this->new_parent_node_id = htmlspecialchars( strip_tags( $this->new_parent_node_id ) );
		$this->move_children      = htmlspecialchars( strip_tags( $this->move_children ) );
	}

	//Gets all data from the table 'nodes'
	public function get() {
		$query = 'SELECT * FROM ' . $this->table;

		$stmt = $this->conn->prepare( $query );

		$stmt->execute();

		return $stmt;
	}

	//Creates a new node into the table 'nodes'
	public function create() {
		$this->sanitizeData();

		$query = 'INSERT INTO ' . $this->table . '
			SET 
			node_name = :node_name,
			parent_node_id = :parent_node_id,
			username = :username';

		$stmt = $this->conn->prepare( $query );

		$stmt->bindParam( ':node_name', $this->node_name );
		$stmt->bindParam( ':parent_node_id', $this->node_id );
		$stmt->bindParam( ':username', $this->username );

		if ( $stmt->execute() ) {
			//It moves the children of the parent node of the newly added node, under the newly added node
			if ( $this->where_to_add_node ) {
				$new_node_id = $this->conn->lastInsertId();

				$query = 'UPDATE ' . $this->table . ' 
                      SET parent_node_id = :new_parent_node_id 
                      WHERE parent_node_id = :old_parent_node_id AND id != :new_node_id';

				$stmt = $this->conn->prepare( $query );
				$stmt->bindParam( ':new_parent_node_id', $new_node_id );
				$stmt->bindParam( ':old_parent_node_id', $this->node_id );
				$stmt->bindParam( ':new_node_id', $new_node_id );
				$stmt->execute();
			}

			return true;
		}

		printf( "Error: %s. \n", $stmt->error );

		return false;
	}

	//Deletes a node or multiple nodes from the table 'nodes'
	public function delete() {
		$this->sanitizeData();

		//Deletes the node and its children
		if ( $this->delete_children ) {
			$this->deleteNodeAndChildren( $this->node_id );

			return true;
		} // Delete only the node
		else {
			$node_to_delete = $this->node_id;

			$query = 'UPDATE ' . $this->table . ' 
                  SET parent_node_id = :new_parent_node_id 
                  WHERE parent_node_id = :parent_node_id';

			$stmt = $this->conn->prepare( $query );
			$stmt->bindParam( ':new_parent_node_id', $this->parent_node_id );
			$stmt->bindParam( ':parent_node_id', $node_to_delete );
			if ( ! $stmt->execute() ) {
				printf( "Error: %s. \n", $stmt->error );

				return false;
			}

			$query = 'DELETE FROM ' . $this->table . ' WHERE id = :node_id LIMIT 1';
			$stmt  = $this->conn->prepare( $query );
			$stmt->bindParam( ':node_id', $node_to_delete, PDO::PARAM_INT );
			if ( ! $stmt->execute() ) {
				printf( "Error: %s. \n", $stmt->error );

				return false;
			}
		}

		return true;
	}

	//Deletes all the children of a node
	public function deleteNodeAndChildren( $node_id ) {
		$children = $this->getChildren( $node_id );

		foreach ( $children as $child ) {
			$this->deleteNodeAndChildren( $child['id'] );
		}

		$query = 'DELETE FROM ' . $this->table . ' WHERE id = :node_id';
		$stmt  = $this->conn->prepare( $query );
		$stmt->bindParam( ':node_id', $node_id, PDO::PARAM_INT );
		if ( ! $stmt->execute() ) {
			printf( "Error: %s. \n", $stmt->error );

			return false;
		}

		return true;
	}

	//Returns all the children of node
	private function getChildren( $parent_id ) {
		$this->sanitizeData();

		$query = 'SELECT id FROM ' . $this->table . ' WHERE parent_node_id = :parent_node_id';
		$stmt  = $this->conn->prepare( $query );
		$stmt->bindParam( ':parent_node_id', $parent_id, PDO::PARAM_INT );
		$stmt->execute();

		return $stmt->fetchAll( PDO::FETCH_ASSOC );
	}

	//Returns true if a node is updated in the table 'nodes'
	function update() {
		$this->sanitizeData();

		//Move the children of the node
		if ( ! $this->move_children ) {
			$query = 'UPDATE ' . $this->table . '
				SET parent_node_id = :parent_node_id
				WHERE parent_node_id = :node_id
			';

			$stmt = $this->conn->prepare( $query );
			$stmt->bindParam( ':parent_node_id', $this->parent_node_id );
			$stmt->bindParam( ':node_id', $this->node_id );
			$stmt->execute();
		}

		//Move only the node, without the children
		$query = 'UPDATE ' . $this->table . '
				SET parent_node_id = :new_parent_node_id
				WHERE id = :node_id
			';

		$stmt = $this->conn->prepare( $query );
		$stmt->bindParam( ':new_parent_node_id', $this->new_parent_node_id );
		$stmt->bindParam( ':node_id', $this->node_id );
		$stmt->execute();

		if ( ! $stmt->execute() ) {
			printf( "Error: %s. \n", $stmt->error );

			return false;
		}

		return true;
	}
}