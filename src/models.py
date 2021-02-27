from __future__ import annotations
from typing import Any, Mapping, Tuple, Union
from random import randint
import pygame


colors = ['y', 'b', 'g', 'r']

starting_points = {
    'y': 0,
    'b': 13,
    'g': 26,
    'r': 39
}

home_base_entry_points = {
    'y': 49,
    'b': 10,
    'g': 23,
    'r': 36
}

FLIGHT_POSITIONS = {
    x: (starting_points[x] + 17) % 52 for x in starting_points.keys() # i.e. `for x in colors`
}

FLIGHT_DESTINATIONS = {
    x: (FLIGHT_POSITIONS[x] + 12) % 52 for x in colors
}

square_colors = {
    'y': 1,
    'b': 2,
    'g': 3,
    'r': 0
}

home_base_indices = {
    'y': 0,
    'b': 1,
    'g': 2,
    'r': 3
}


class Plane(pygame.sprite.Sprite):
    def __init__(self, color, position):
        super().__init__()
        self.color = color
        self.position = position
        self.image = pygame.Surface((20, 20), pygame.SRCALPHA, 32).convert()
        self.selected = False
        self.completed = False

    def map_position_to_board(self) -> int:
        """
        maps position to int representing central pixel of its position on board.
        pixel can be either in airport, in activation center, on main square, or in home base / other central squares.

        todo: figure out what positions correspond to what pixels.
                currently, { 
                                None ––> airport,
                                'activated' ––> space between airport and first square,
                                int ––> main square,
                                tuple (inferred) ––> home base / other central squares
                            }
        """

        # this is when plane is in airport and cannot move
        if position is None:
            # todo: logic for drawing plane in home airport – replace `pass`
            pass

        # this is when a 6 has been rolled and the plane has been activated, but not yet put onto a square
        elif position == 'activated':
            # todo: logic for drawing plane in space where it is activated but not on squares
            pass

        # this is when a plane is on a main square, i.e. a square not in its home base
        elif isinstance(position, int):
            # todo: logic for drawing plane on corresponding square
            pass

        # this is when a plane is either in its home base or on one of the other central squares
        else:
            # todo: logic for drawing plane on corresponding square in home base (or one of the four central squares)
            pass

    # returns (position, completed)
    def get_move(self, num_rolled) -> tuple[Any, bool]:
        completed = False
        # cases when plane is activated but not on square
        if self.position == 'activated':
            intermediate_position = num_rolled - 1

        # cases when plane is on a main square
        elif isinstance(self.position, int):
            intermediate_position = (self.position + num_rolled) % 52

            # logic for plane reaching home base
            if home_base_entry_points[self.color] in range(self.position, intermediate_position):
                position = (home_base_indices[self.color], intermediate_position - home_base_entry_points[self.color])
                return position, completed

            # logic for plane landing on own color
            if intermediate_position % 4 == square_color_indices[self.color]:
                if intermediate_position == home_base_entry_points[self.color]:
                    position = intermediate_position
                    return position
                elif intermediate_position == FLIGHT_POSITIONS[self.color]:
                    position = FLIGHT_DESTINATIONS[self.color]
                    return position, completed

        # cases when plane is in home base
        elif isinstance(self.position, tuple) and len(self.position) == 2:
            # cases when plane is in own home base and not other central squares
            if self.position[0] == home_base_indices[self.color]:
                intermediate_position = (self.position[0], self.position[1] + num_rolled)
                
                # logic for when plane lands on winning spot
                if intermediate_position == (home_base_indices[self.color], 5):
                    position = intermediate_position
                    completed = True
                    return position, completed

                # logic for when plane lands before winning spot
                elif intermediate_position[1] < 5:
                    position = intermediate_position
                    return position, completed
                else:
                    color_index = (intermediate_position[1] - 5) % 4
                    position = (color_index, 5)
                    return position, completed

    # update either self.position or self.completed
    def move(self, roll) -> None:
        position, completed = self.get_move(roll)
        if completed:
            self.completed = True
            # then in `Game` – plane should be removed from list of `self.{y, b, g, r}_planes`
        else:
            self.position = position

            
                

class Game:
    def __init__(self):

        self.num_squares = 52
        self.main_squares = [x for x in range (0, self.num_squares)]
        self.yellow_home_squares = [(0, x) for x in range(0, 6)]
        self.blue_home_squares = [(1, x) for x in range(0, 6)]
        self.green_home_squares = [(2, x) for x in range(0, 6)]
        self.red_home_squares = [(3, x) for x in range(0, 6)]

        self.yellow_planes = [Plane('y', None)] * 4
        self.blue_planes = [Plane('b', None)] * 4
        self.green_planes = [Plane('g', None)] * 4
        self.red_planes = [Plane('r', None)] * 4

        self.plane_groups = {
            'rb': (self.blue_planes, self.red_planes),
            'yg': (self.yellow_planes, self.red_planes)
        }
        
        self.player_turn = 'rb'
        self.num_rolls = 2

    def get_roll_number(self):
        return randint(1, 7)

    # note to self: when implementing in `self.update()``, pass value of `self.get_roll_number()` to `self.draw_dice()`
    def draw_dice(self, roll):
        # todo: implement drawing
        pass

    def move_piece(self, roll, plane: Plane):
        if roll != 6:
            self.num_rolls -= 1
            plane.move(roll)
        else:
            plane.move(roll)
        if num_rolls == 0:
            self.swap_turns()

    def generate_legal_moves(self, roll) -> Mapping[Plane, Tuple[Any, bool]]:
        player_turn = self.player_turn
        legal_pieces = [x for x in y for y in self.plane_groups[player_turn]]
        legal_moves = {
            x: x.get_move(roll) for x in legal_pieces
        }
        return legal_moves

    def swap_turns(self):
        self.num_rolls = 2
        if self.player_turn == 'rb':
            self.player_turn = 'yg'
        else:
            self.player_turn = 'rb'

    def update(self, event):
        pass