import sys
import pygame




pygame.init()
clock = pygame.time.Clock()
screen = pygame.display.set_mode((612, 612))
background = pygame.image.load('../images/board.png').convert()
background = pygame.transform.scale2x(background).convert()

game = Game()

player_turn = 'RB'
num_rolls = 2

while True:
    
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()
        
        # todo: write logic for update based on event type
        game.update(event)
        
    
    screen.blit(background, (0, 0))
    
    pygame.display.update()
    clock.tick(4)
