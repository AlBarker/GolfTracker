-- SQL Script to insert dummy test data for Golf Tracker
-- User ID: 6288d7fa-865b-4430-85fa-a9cd61df8130

-- Insert Course 1: Pine Valley Golf Course
INSERT INTO courses (id, user_id, name, created_at) VALUES 
('a1b2c3d4-e5f6-1234-abcd-ef1234567890', '6288d7fa-865b-4430-85fa-a9cd61df8130', 'Pine Valley Golf Course', '2024-01-15T10:00:00Z');

-- Insert holes for Pine Valley Golf Course (18 holes)
INSERT INTO holes (course_id, number, par, handicap_index, notes) VALUES 
('a1b2c3d4-e5f6-1234-abcd-ef1234567890', 1, 4, 5, 'Dogleg right, avoid trees on left'),
('a1b2c3d4-e5f6-1234-abcd-ef1234567890', 2, 3, 17, 'Short par 3, elevated green'),
('a1b2c3d4-e5f6-1234-abcd-ef1234567890', 3, 5, 1, 'Long par 5, reachable in two'),
('a1b2c3d4-e5f6-1234-abcd-ef1234567890', 4, 4, 9, 'Straight away, bunkers right'),
('a1b2c3d4-e5f6-1234-abcd-ef1234567890', 5, 4, 13, 'Water hazard on left'),
('a1b2c3d4-e5f6-1234-abcd-ef1234567890', 6, 3, 15, 'Island green, precise club selection'),
('a1b2c3d4-e5f6-1234-abcd-ef1234567890', 7, 4, 7, 'Dogleg left, driver optional'),
('a1b2c3d4-e5f6-1234-abcd-ef1234567890', 8, 5, 3, 'Three shot par 5, narrow fairway'),
('a1b2c3d4-e5f6-1234-abcd-ef1234567890', 9, 4, 11, 'Uphill finish, big green'),
('a1b2c3d4-e5f6-1234-abcd-ef1234567890', 10, 4, 6, 'Downhill start, avoid rough'),
('a1b2c3d4-e5f6-1234-abcd-ef1234567890', 11, 3, 16, 'Long par 3, back tees play 180'),
('a1b2c3d4-e5f6-1234-abcd-ef1234567890', 12, 5, 2, 'Risk/reward second shot'),
('a1b2c3d4-e5f6-1234-abcd-ef1234567890', 13, 4, 8, 'Blind tee shot, stay center'),
('a1b2c3d4-e5f6-1234-abcd-ef1234567890', 14, 4, 14, 'Approach over water'),
('a1b2c3d4-e5f6-1234-abcd-ef1234567890', 15, 3, 18, 'Short but tricky, wind factor'),
('a1b2c3d4-e5f6-1234-abcd-ef1234567890', 16, 4, 4, 'Most difficult hole, narrow landing'),
('a1b2c3d4-e5f6-1234-abcd-ef1234567890', 17, 5, 10, 'Closing par 5, go for it'),
('a1b2c3d4-e5f6-1234-abcd-ef1234567890', 18, 4, 12, 'Great finishing hole, grandstand');

-- Insert Course 2: Ocean Breeze Country Club
INSERT INTO courses (id, user_id, name, created_at) VALUES 
('b2c3d4e5-a6b7-5678-bcde-123456789012', '6288d7fa-865b-4430-85fa-a9cd61df8130', 'Ocean Breeze Country Club', '2024-02-20T14:30:00Z');

-- Insert holes for Ocean Breeze Country Club (18 holes)
INSERT INTO holes (course_id, number, par, handicap_index, notes) VALUES 
('b2c3d4e5-a6b7-5678-bcde-123456789012', 1, 4, 7, 'Opening hole, ocean view'),
('b2c3d4e5-a6b7-5678-bcde-123456789012', 2, 3, 15, 'Over the dunes, wind plays factor'),
('b2c3d4e5-a6b7-5678-bcde-123456789012', 3, 4, 3, 'Tight fairway, precision required'),
('b2c3d4e5-a6b7-5678-bcde-123456789012', 4, 5, 1, 'Signature hole, play along coastline'),
('b2c3d4e5-a6b7-5678-bcde-123456789012', 5, 4, 11, 'Elevated tee, scenic views'),
('b2c3d4e5-a6b7-5678-bcde-123456789012', 6, 3, 17, 'Shortest hole, but heavily bunkered'),
('b2c3d4e5-a6b7-5678-bcde-123456789012', 7, 4, 5, 'Dogleg around large oak tree'),
('b2c3d4e5-a6b7-5678-bcde-123456789012', 8, 4, 9, 'Approach to peninsula green'),
('b2c3d4e5-a6b7-5678-bcde-123456789012', 9, 5, 13, 'Turn for home, reachable par 5'),
('b2c3d4e5-a6b7-5678-bcde-123456789012', 10, 4, 8, 'Back nine opener, slightly uphill'),
('b2c3d4e5-a6b7-5678-bcde-123456789012', 11, 3, 16, 'Clifftop green, spectacular views'),
('b2c3d4e5-a6b7-5678-bcde-123456789012', 12, 4, 4, 'Most challenging approach shot'),
('b2c3d4e5-a6b7-5678-bcde-123456789012', 13, 5, 2, 'Long par 5, three good shots needed'),
('b2c3d4e5-a6b7-5678-bcde-123456789012', 14, 4, 12, 'Coastal winds affect ball flight'),
('b2c3d4e5-a6b7-5678-bcde-123456789012', 15, 3, 18, 'Easiest par 3, good birdie chance'),
('b2c3d4e5-a6b7-5678-bcde-123456789012', 16, 4, 6, 'Risk/reward tee shot over water'),
('b2c3d4e5-a6b7-5678-bcde-123456789012', 17, 4, 14, 'Penultimate hole, stay patient'),
('b2c3d4e5-a6b7-5678-bcde-123456789012', 18, 4, 10, 'Finishing in style, ocean backdrop');

-- Rounds for Pine Valley Golf Course
-- Round 1 (Score: 85)
INSERT INTO rounds (id, course_id, date_played, total_score, created_at) VALUES 
('c3d4e5f6-a7b8-9012-cdef-234567890123', 'a1b2c3d4-e5f6-1234-abcd-ef1234567890', '2024-03-15T09:00:00Z', 85, '2024-03-15T16:30:00Z');

INSERT INTO hole_scores (round_id, hole_number, strokes, putts, fairway_hit, green_in_regulation, penalty_shots, up_and_down) VALUES 
('c3d4e5f6-a7b8-9012-cdef-234567890123', 1, 5, 2, 'hit', false, 0, false),
('c3d4e5f6-a7b8-9012-cdef-234567890123', 2, 4, 2, null, false, 0, true),
('c3d4e5f6-a7b8-9012-cdef-234567890123', 3, 6, 3, 'left', false, 1, false),
('c3d4e5f6-a7b8-9012-cdef-234567890123', 4, 4, 2, 'hit', true, 0, false),
('c3d4e5f6-a7b8-9012-cdef-234567890123', 5, 5, 2, 'right', false, 0, true),
('c3d4e5f6-a7b8-9012-cdef-234567890123', 6, 3, 2, null, true, 0, false),
('c3d4e5f6-a7b8-9012-cdef-234567890123', 7, 4, 1, 'hit', true, 0, false),
('c3d4e5f6-a7b8-9012-cdef-234567890123', 8, 5, 2, 'hit', true, 0, false),
('c3d4e5f6-a7b8-9012-cdef-234567890123', 9, 5, 3, 'left', false, 0, false),
('c3d4e5f6-a7b8-9012-cdef-234567890123', 10, 4, 2, 'hit', true, 0, false),
('c3d4e5f6-a7b8-9012-cdef-234567890123', 11, 4, 2, null, false, 0, true),
('c3d4e5f6-a7b8-9012-cdef-234567890123', 12, 5, 2, 'hit', true, 0, false),
('c3d4e5f6-a7b8-9012-cdef-234567890123', 13, 5, 2, 'right', false, 0, true),
('c3d4e5f6-a7b8-9012-cdef-234567890123', 14, 4, 2, 'hit', true, 0, false),
('c3d4e5f6-a7b8-9012-cdef-234567890123', 15, 2, 1, null, true, 0, false),
('c3d4e5f6-a7b8-9012-cdef-234567890123', 16, 5, 3, 'left', false, 0, false),
('c3d4e5f6-a7b8-9012-cdef-234567890123', 17, 5, 2, 'hit', true, 0, false),
('c3d4e5f6-a7b8-9012-cdef-234567890123', 18, 4, 2, 'hit', true, 0, false);

-- Round 2 (Score: 78)
INSERT INTO rounds (id, course_id, date_played, total_score, created_at) VALUES 
('d4e5f6a7-b8c9-0123-defa-345678901234', 'a1b2c3d4-e5f6-1234-abcd-ef1234567890', '2024-04-10T08:30:00Z', 78, '2024-04-10T15:45:00Z');

INSERT INTO hole_scores (round_id, hole_number, strokes, putts, fairway_hit, green_in_regulation, penalty_shots, up_and_down) VALUES 
('d4e5f6a7-b8c9-0123-defa-345678901234', 1, 4, 2, 'hit', true, 0, false),
('d4e5f6a7-b8c9-0123-defa-345678901234', 2, 3, 2, null, true, 0, false),
('d4e5f6a7-b8c9-0123-defa-345678901234', 3, 5, 2, 'hit', true, 0, false),
('d4e5f6a7-b8c9-0123-defa-345678901234', 4, 4, 2, 'hit', true, 0, false),
('d4e5f6a7-b8c9-0123-defa-345678901234', 5, 3, 1, 'hit', true, 0, false),
('d4e5f6a7-b8c9-0123-defa-345678901234', 6, 3, 2, null, true, 0, false),
('d4e5f6a7-b8c9-0123-defa-345678901234', 7, 4, 2, 'hit', true, 0, false),
('d4e5f6a7-b8c9-0123-defa-345678901234', 8, 5, 2, 'hit', true, 0, false),
('d4e5f6a7-b8c9-0123-defa-345678901234', 9, 4, 2, 'hit', true, 0, false),
('d4e5f6a7-b8c9-0123-defa-345678901234', 10, 4, 2, 'hit', true, 0, false),
('d4e5f6a7-b8c9-0123-defa-345678901234', 11, 3, 2, null, true, 0, false),
('d4e5f6a7-b8c9-0123-defa-345678901234', 12, 4, 1, 'hit', true, 0, false),
('d4e5f6a7-b8c9-0123-defa-345678901234', 13, 5, 3, 'left', false, 0, false),
('d4e5f6a7-b8c9-0123-defa-345678901234', 14, 4, 2, 'hit', true, 0, false),
('d4e5f6a7-b8c9-0123-defa-345678901234', 15, 3, 2, null, true, 0, false),
('d4e5f6a7-b8c9-0123-defa-345678901234', 16, 5, 2, 'right', false, 0, true),
('d4e5f6a7-b8c9-0123-defa-345678901234', 17, 5, 2, 'hit', true, 0, false),
('d4e5f6a7-b8c9-0123-defa-345678901234', 18, 4, 2, 'hit', true, 0, false);

-- Round 3 (Score: 82)
INSERT INTO rounds (id, course_id, date_played, total_score, created_at) VALUES 
('e5f6a7b8-c9d0-1234-efab-456789012345', 'a1b2c3d4-e5f6-1234-abcd-ef1234567890', '2024-05-05T10:15:00Z', 82, '2024-05-05T17:20:00Z');

INSERT INTO hole_scores (round_id, hole_number, strokes, putts, fairway_hit, green_in_regulation, penalty_shots, up_and_down) VALUES 
('e5f6a7b8-c9d0-1234-efab-456789012345', 1, 5, 2, 'right', false, 0, true),
('e5f6a7b8-c9d0-1234-efab-456789012345', 2, 3, 2, null, true, 0, false),
('e5f6a7b8-c9d0-1234-efab-456789012345', 3, 6, 3, 'left', false, 1, false),
('e5f6a7b8-c9d0-1234-efab-456789012345', 4, 4, 2, 'hit', true, 0, false),
('e5f6a7b8-c9d0-1234-efab-456789012345', 5, 4, 2, 'hit', true, 0, false),
('e5f6a7b8-c9d0-1234-efab-456789012345', 6, 4, 3, null, false, 0, false),
('e5f6a7b8-c9d0-1234-efab-456789012345', 7, 4, 2, 'hit', true, 0, false),
('e5f6a7b8-c9d0-1234-efab-456789012345', 8, 5, 2, 'hit', true, 0, false),
('e5f6a7b8-c9d0-1234-efab-456789012345', 9, 4, 2, 'hit', true, 0, false),
('e5f6a7b8-c9d0-1234-efab-456789012345', 10, 5, 3, 'left', false, 0, false),
('e5f6a7b8-c9d0-1234-efab-456789012345', 11, 3, 2, null, true, 0, false),
('e5f6a7b8-c9d0-1234-efab-456789012345', 12, 5, 2, 'hit', true, 0, false),
('e5f6a7b8-c9d0-1234-efab-456789012345', 13, 4, 2, 'hit', true, 0, false),
('e5f6a7b8-c9d0-1234-efab-456789012345', 14, 5, 3, 'right', false, 0, false),
('e5f6a7b8-c9d0-1234-efab-456789012345', 15, 3, 2, null, true, 0, false),
('e5f6a7b8-c9d0-1234-efab-456789012345', 16, 4, 2, 'hit', true, 0, false),
('e5f6a7b8-c9d0-1234-efab-456789012345', 17, 4, 1, 'hit', true, 0, false),
('e5f6a7b8-c9d0-1234-efab-456789012345', 18, 4, 2, 'hit', true, 0, false);

-- Rounds for Ocean Breeze Country Club
-- Round 1 (Score: 89)
INSERT INTO rounds (id, course_id, date_played, total_score, created_at) VALUES 
('f6a7b8c9-d0e1-2345-fabc-567890123456', 'b2c3d4e5-a6b7-5678-bcde-123456789012', '2024-03-28T11:00:00Z', 89, '2024-03-28T18:15:00Z');

INSERT INTO hole_scores (round_id, hole_number, strokes, putts, fairway_hit, green_in_regulation, penalty_shots, up_and_down) VALUES 
('f6a7b8c9-d0e1-2345-fabc-567890123456', 1, 5, 2, 'left', false, 0, true),
('f6a7b8c9-d0e1-2345-fabc-567890123456', 2, 4, 3, null, false, 0, false),
('f6a7b8c9-d0e1-2345-fabc-567890123456', 3, 5, 2, 'right', false, 0, true),
('f6a7b8c9-d0e1-2345-fabc-567890123456', 4, 6, 3, 'left', false, 1, false),
('f6a7b8c9-d0e1-2345-fabc-567890123456', 5, 4, 2, 'hit', true, 0, false),
('f6a7b8c9-d0e1-2345-fabc-567890123456', 6, 3, 2, null, true, 0, false),
('f6a7b8c9-d0e1-2345-fabc-567890123456', 7, 5, 3, 'right', false, 0, false),
('f6a7b8c9-d0e1-2345-fabc-567890123456', 8, 4, 2, 'hit', true, 0, false),
('f6a7b8c9-d0e1-2345-fabc-567890123456', 9, 5, 2, 'hit', true, 0, false),
('f6a7b8c9-d0e1-2345-fabc-567890123456', 10, 4, 2, 'hit', true, 0, false),
('f6a7b8c9-d0e1-2345-fabc-567890123456', 11, 4, 3, null, false, 0, false),
('f6a7b8c9-d0e1-2345-fabc-567890123456', 12, 5, 2, 'left', false, 0, true),
('f6a7b8c9-d0e1-2345-fabc-567890123456', 13, 6, 3, 'right', false, 1, false),
('f6a7b8c9-d0e1-2345-fabc-567890123456', 14, 4, 2, 'hit', true, 0, false),
('f6a7b8c9-d0e1-2345-fabc-567890123456', 15, 3, 2, null, true, 0, false),
('f6a7b8c9-d0e1-2345-fabc-567890123456', 16, 5, 3, 'left', false, 0, false),
('f6a7b8c9-d0e1-2345-fabc-567890123456', 17, 4, 2, 'hit', true, 0, false),
('f6a7b8c9-d0e1-2345-fabc-567890123456', 18, 5, 2, 'right', false, 0, true);

-- Round 2 (Score: 81)
INSERT INTO rounds (id, course_id, date_played, total_score, created_at) VALUES 
('a7b8c9d0-e1f2-3456-abcd-678901234567', 'b2c3d4e5-a6b7-5678-bcde-123456789012', '2024-04-22T09:45:00Z', 81, '2024-04-22T16:30:00Z');

INSERT INTO hole_scores (round_id, hole_number, strokes, putts, fairway_hit, green_in_regulation, penalty_shots, up_and_down) VALUES 
('a7b8c9d0-e1f2-3456-abcd-678901234567', 1, 4, 2, 'hit', true, 0, false),
('a7b8c9d0-e1f2-3456-abcd-678901234567', 2, 3, 2, null, true, 0, false),
('a7b8c9d0-e1f2-3456-abcd-678901234567', 3, 4, 2, 'hit', true, 0, false),
('a7b8c9d0-e1f2-3456-abcd-678901234567', 4, 5, 2, 'hit', true, 0, false),
('a7b8c9d0-e1f2-3456-abcd-678901234567', 5, 4, 2, 'hit', true, 0, false),
('a7b8c9d0-e1f2-3456-abcd-678901234567', 6, 2, 1, null, true, 0, false),
('a7b8c9d0-e1f2-3456-abcd-678901234567', 7, 5, 3, 'left', false, 0, false),
('a7b8c9d0-e1f2-3456-abcd-678901234567', 8, 4, 2, 'hit', true, 0, false),
('a7b8c9d0-e1f2-3456-abcd-678901234567', 9, 5, 2, 'hit', true, 0, false),
('a7b8c9d0-e1f2-3456-abcd-678901234567', 10, 4, 2, 'hit', true, 0, false),
('a7b8c9d0-e1f2-3456-abcd-678901234567', 11, 3, 2, null, true, 0, false),
('a7b8c9d0-e1f2-3456-abcd-678901234567', 12, 5, 3, 'right', false, 0, false),
('a7b8c9d0-e1f2-3456-abcd-678901234567', 13, 5, 2, 'hit', true, 0, false),
('a7b8c9d0-e1f2-3456-abcd-678901234567', 14, 4, 2, 'hit', true, 0, false),
('a7b8c9d0-e1f2-3456-abcd-678901234567', 15, 3, 2, null, true, 0, false),
('a7b8c9d0-e1f2-3456-abcd-678901234567', 16, 4, 2, 'hit', true, 0, false),
('a7b8c9d0-e1f2-3456-abcd-678901234567', 17, 5, 2, 'left', false, 0, true),
('a7b8c9d0-e1f2-3456-abcd-678901234567', 18, 4, 2, 'hit', true, 0, false);

-- Round 3 (Score: 86)
INSERT INTO rounds (id, course_id, date_played, total_score, created_at) VALUES 
('b8c9d0e1-f2a3-4567-bcde-789012345678', 'b2c3d4e5-a6b7-5678-bcde-123456789012', '2024-06-12T08:00:00Z', 86, '2024-06-12T15:45:00Z');

INSERT INTO hole_scores (round_id, hole_number, strokes, putts, fairway_hit, green_in_regulation, penalty_shots, up_and_down) VALUES 
('b8c9d0e1-f2a3-4567-bcde-789012345678', 1, 4, 2, 'hit', true, 0, false),
('b8c9d0e1-f2a3-4567-bcde-789012345678', 2, 4, 3, null, false, 0, false),
('b8c9d0e1-f2a3-4567-bcde-789012345678', 3, 5, 2, 'right', false, 0, true),
('b8c9d0e1-f2a3-4567-bcde-789012345678', 4, 5, 2, 'hit', true, 0, false),
('b8c9d0e1-f2a3-4567-bcde-789012345678', 5, 5, 3, 'left', false, 0, false),
('b8c9d0e1-f2a3-4567-bcde-789012345678', 6, 3, 2, null, true, 0, false),
('b8c9d0e1-f2a3-4567-bcde-789012345678', 7, 4, 2, 'hit', true, 0, false),
('b8c9d0e1-f2a3-4567-bcde-789012345678', 8, 5, 3, 'right', false, 0, false),
('b8c9d0e1-f2a3-4567-bcde-789012345678', 9, 5, 2, 'hit', true, 0, false),
('b8c9d0e1-f2a3-4567-bcde-789012345678', 10, 4, 2, 'hit', true, 0, false),
('b8c9d0e1-f2a3-4567-bcde-789012345678', 11, 3, 2, null, true, 0, false),
('b8c9d0e1-f2a3-4567-bcde-789012345678', 12, 4, 2, 'hit', true, 0, false),
('b8c9d0e1-f2a3-4567-bcde-789012345678', 13, 6, 3, 'left', false, 1, false),
('b8c9d0e1-f2a3-4567-bcde-789012345678', 14, 4, 2, 'hit', true, 0, false),
('b8c9d0e1-f2a3-4567-bcde-789012345678', 15, 4, 3, null, false, 0, false),
('b8c9d0e1-f2a3-4567-bcde-789012345678', 16, 4, 2, 'hit', true, 0, false),
('b8c9d0e1-f2a3-4567-bcde-789012345678', 17, 4, 2, 'hit', true, 0, false),
('b8c9d0e1-f2a3-4567-bcde-789012345678', 18, 5, 3, 'left', false, 0, false);