export class Window {
    constructor(title, content, width = 500, height = 400) {
        this.title = title;
        this.content = content;
        this.width = width;
        this.height = height;
        this.isMinimized = false;
        this.isMaximized = false;
        this.previousState = null;
        this.isResizing = false;

        this.create();

        this.element.addEventListener('remove', () => {
            if (this.resizeObserver) {
                this.resizeObserver.disconnect();
            }
            if (this.taskbarEntry && this.taskbarEntry.parentNode) {
                this.taskbarEntry.parentNode.removeChild(this.taskbarEntry);
            }
        });
    }

    async create() {
        const isMaximizable = this.title !== 'SuperPong' && this.title !== 'ticTacToe';
        this.element = document.createElement('div');
        this.element.className = 'window';
        this.element.style.width = this.width + 'px';
        this.element.style.height = this.height + 'px';
        this.element.style.minWidth = this.width + 'px';
        this.element.style.minHeight = this.height + 'px';
        
        // Set initial position to center without using transform
        const left = (window.innerWidth - this.width) / 2;
        const top = (window.innerHeight - this.height) / 2;
        this.element.style.left = `${left}px`;
        this.element.style.top = `${top}px`;
        const tempContent = await this.content;
        this.element.innerHTML = `
            <div class="title-bar">
                <div class="title-bar-text">${this.title}</div>
                <div class="title-bar-controls">
                    <button aria-label="Minimize"></button>
                    ${isMaximizable ? '<button aria-label="Maximize"></button>' : ''}
                    <button aria-label="Close"></button>
                </div>
            </div>
            <div class="window-body">
                ${tempContent}
            </div>
        `;
    
        document.body.appendChild(this.element);
        this.createTaskbarEntry();
    
        // Add ResizeObserver to adjust size based on content
        this.resizeObserver = new ResizeObserver(entries => {
            if (this.isResizing) return;
            this.isResizing = true;
    
            for (let entry of entries) {
                const windowBody = this.element.querySelector('.window-body');
                if (entry.target === windowBody && !this.isMaximized) {
                    this.updateWindowSize(windowBody);
                }
            }
    
            // Release the lock after a short delay
            setTimeout(() => {
                this.isResizing = false;
            }, 100);
        });
        
        // Start observing the window body
        const windowBody = this.element.querySelector('.window-body');
        this.resizeObserver.observe(windowBody);
        
        // Add mutation observer to detect DOM changes
        this.mutationObserver = new MutationObserver((mutations) => {
            // Check for visibility changes (display property)
            const hasVisibilityChanges = mutations.some(mutation => 
                mutation.type === 'attributes' && 
                (mutation.attributeName === 'style' || mutation.attributeName === 'class')
            );
            
            if (hasVisibilityChanges) {
                // Give the browser time to apply styles
                setTimeout(() => this.updateWindowSize(windowBody), 50);
            } else {
                // For other changes, debounce
                clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(() => {
                    this.updateWindowSize(windowBody);
                }, 100);
            }
        });
        
        this.mutationObserver.observe(windowBody, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class'],
            characterData: true
        });
        
        // Add image load handler
        windowBody.addEventListener('load', (e) => {
            if (e.target.tagName === 'IMG') {
                setTimeout(() => this.updateWindowSize(windowBody), 50);
            }
        }, true);
        
        // Create public methods for manual size updates
        this.recalculateSize = () => {
            if (!this.isMaximized) {
                setTimeout(() => this.updateWindowSize(windowBody), 50);
            }
        };
        
        // Expose as element method too
        this.element.recalculateSize = this.recalculateSize;
        
        // Clean up observers when window is removed
        this.element.addEventListener('remove', () => {
            if (this.resizeObserver) {
                this.resizeObserver.disconnect();
            }
            if (this.mutationObserver) {
                this.mutationObserver.disconnect();
            }
            if (this.resizeTimeout) {
                clearTimeout(this.resizeTimeout);
            }
            if (this.taskbarEntry && this.taskbarEntry.parentNode) {
                this.taskbarEntry.parentNode.removeChild(this.taskbarEntry);
            }
        });
        
        this.setupEventListeners();
    }
    
    // New method to handle window sizing logic
    updateWindowSize(windowBody) {
        if (!windowBody || this.isMaximized) return;
        
        // Force a layout calculation
        void windowBody.offsetHeight;
        
        try {
            // Get the title bar height
            const titleBar = this.element.querySelector('.title-bar');
            const titleBarHeight = titleBar ? titleBar.offsetHeight : 0;
            
            // Window style calculations
            const windowStyle = window.getComputedStyle(this.element);
            const windowPadding = {
                top: parseFloat(windowStyle.paddingTop) || 0,
                right: parseFloat(windowStyle.paddingRight) || 0,
                bottom: parseFloat(windowStyle.paddingBottom) || 0,
                left: parseFloat(windowStyle.paddingLeft) || 0
            };
            const windowBorder = {
                top: parseFloat(windowStyle.borderTopWidth) || 0,
                right: parseFloat(windowStyle.borderRightWidth) || 0,
                bottom: parseFloat(windowStyle.borderBottomWidth) || 0,
                left: parseFloat(windowStyle.borderLeftWidth) || 0
            };
            
            // Window body style calculations
            const bodyStyle = window.getComputedStyle(windowBody);
            const bodyMargin = {
                top: parseFloat(bodyStyle.marginTop) || 0,
                right: parseFloat(bodyStyle.marginRight) || 0,
                bottom: parseFloat(bodyStyle.marginBottom) || 0,
                left: parseFloat(bodyStyle.marginLeft) || 0
            };
            
            // Get max-width constraints from content elements
            let contentMaxWidth = 0;
            
            // Check for specific elements with max-width (app_oelboukh, menu_oelboukh, game_oelboukh)
            const appEl = windowBody.querySelector('#app_oelboukh');
            const menuEl = windowBody.querySelector('#menu_oelboukh');
            const gameEl = windowBody.querySelector('#game_oelboukh');
            
            if (appEl) {
                const appStyle = window.getComputedStyle(appEl);
                const appMaxWidth = parseFloat(appStyle.maxWidth);
                if (!isNaN(appMaxWidth) && appMaxWidth > 0) {
                    contentMaxWidth = Math.max(contentMaxWidth, appMaxWidth);
                }
            }
            
            // Check which elements are actually visible
            if (menuEl && window.getComputedStyle(menuEl).display !== 'none') {
                const menuStyle = window.getComputedStyle(menuEl);
                const menuMaxWidth = parseFloat(menuStyle.maxWidth);
                const menuPadding = parseFloat(menuStyle.paddingLeft) + parseFloat(menuStyle.paddingRight);
                const menuBorder = parseFloat(menuStyle.borderLeftWidth) + parseFloat(menuStyle.borderRightWidth);
                
                if (!isNaN(menuMaxWidth) && menuMaxWidth > 0) {
                    contentMaxWidth = Math.max(contentMaxWidth, menuMaxWidth + menuPadding + menuBorder);
                }
            }
            
            if (gameEl && window.getComputedStyle(gameEl).display !== 'none') {
                const gameStyle = window.getComputedStyle(gameEl);
                const gameMaxWidth = parseFloat(gameStyle.maxWidth);
                const gamePadding = parseFloat(gameStyle.paddingLeft) + parseFloat(gameStyle.paddingRight);
                const gameBorder = parseFloat(gameStyle.borderLeftWidth) + parseFloat(gameStyle.borderRightWidth);
                
                if (!isNaN(gameMaxWidth) && gameMaxWidth > 0) {
                    contentMaxWidth = Math.max(contentMaxWidth, gameMaxWidth + gamePadding + gameBorder);
                }
            }
            
            // First approach: use direct content dimensions
            let contentWidth = Math.max(
                windowBody.scrollWidth,
                windowBody.clientWidth
            );
            
            let contentHeight = Math.max(
                windowBody.scrollHeight,
                windowBody.clientHeight
            );
            
            // Adjust for max-width elements if they have auto margins
            if (contentMaxWidth > 0) {
                contentWidth = Math.max(contentWidth, contentMaxWidth);
            }
            
            // Calculate the total required dimensions
            const horizontalExtra = 
                windowPadding.left + windowPadding.right + 
                windowBorder.left + windowBorder.right +
                bodyMargin.left + bodyMargin.right;
            
            const verticalExtra = 
                windowPadding.top + windowPadding.bottom + 
                windowBorder.top + windowBorder.bottom + 
                bodyMargin.top + bodyMargin.bottom +
                titleBarHeight;
            
            const requiredWidth = contentWidth + horizontalExtra;
            const requiredHeight = contentHeight + verticalExtra;
            
            // Constrain to screen dimensions
            const screenWidth = window.innerWidth - 40; // 20px margin on each side
            const screenHeight = window.innerHeight - 40;
            
            // Debug output
            //console.log('Window size calculation:', {
            //     contentWidth,
            //     contentHeight,
            //     contentMaxWidth,
            //     titleBarHeight,
            //     horizontalExtra,
            //     verticalExtra,
            //     requiredWidth,
            //     requiredHeight,
            //     screenDimensions: { width: screenWidth, height: screenHeight }
            // });
            
            // Check if content exceeds screen dimensions
            if ((requiredWidth > screenWidth || requiredHeight > screenHeight) && this.title !== 'ticTacToe' && this.title !== 'SuperPong') {
                //console.log('Content exceeds screen dimensions, maximizing');
                this.maximize();
                //in case of tictactoe don't set overflow
                    windowBody.style.overflow = 'auto';
            } else {
                // Use whichever is larger: required dimensions or minimum dimensions
                const finalWidth = Math.max(requiredWidth, this.width);
                const finalHeight = Math.max(requiredHeight, this.height);
                
                //console.log('Setting window size to:', { width: finalWidth, height: finalHeight });
                
                this.element.style.width = `${finalWidth}px`;
                this.element.style.height = `${finalHeight}px`;
                windowBody.style.overflow = 'visible';
                windowBody.style.maxHeight = '';
            }
        } catch (error) {
            console.error('Error calculating window size:', error);
        }
    }

    createTaskbarEntry() {
        this.taskbarEntry = document.createElement('div');
        this.taskbarEntry.className = 'taskbar-item active';
        this.taskbarEntry.textContent = this.title;
        
        const taskbarItems = document.getElementById('taskbarItems');
        taskbarItems.appendChild(this.taskbarEntry);

        // Add wheel scroll handler if not already added
        if (!window.taskbarWheelHandler) {
            window.taskbarWheelHandler = true;
            taskbarItems.addEventListener('wheel', (e) => {
                e.preventDefault();
                taskbarItems.scrollLeft += e.deltaY;
            });
        }

        this.taskbarEntry.addEventListener('click', () => this.toggleMinimize());
    }
    handleResize() {
        // Get window dimensions
        const rect = this.element.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight - 28; // Subtract taskbar height
    
        // Get current position
        let left = parseInt(this.element.style.left);
        let top = parseInt(this.element.style.top);
    
        // Check right edge
        if (left + rect.width > viewportWidth) {
            left = viewportWidth - rect.width;
        }
    
        // Check bottom edge
        if (top + rect.height > viewportHeight) {
            top = viewportHeight - rect.height;
        }
    
        // Check left edge
        if (left < 0) {
            left = 0;
        }
    
        // Check top edge
        if (top < 0) {
            top = 0;
        }
    
        // Apply new position
        this.element.style.left = `${left}px`;
        this.element.style.top = `${top}px`;
    
        // Handle maximized state
        if (this.isMaximized) {
            this.element.style.width = '100%';
            this.element.style.height = `${viewportHeight}px`;
            this.element.style.left = '0';
            this.element.style.top = '0';
        }
    }

    setupEventListeners() {
        // Window dragging
        const titleBar = this.element.querySelector('.title-bar');
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;

        titleBar.addEventListener('mousedown', (e) => {
            if (this.isMaximized) return;
            if (e.target === titleBar || e.target.classList.contains('title-bar-text')) {
                isDragging = true;
                const rect = this.element.getBoundingClientRect();
                initialX = e.clientX - rect.left;
                initialY = e.clientY - rect.top;
            }
        });

            // Add resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                
                // Calculate new position
                let newX = e.clientX - initialX;
                let newY = e.clientY - initialY;

                // Get viewport boundaries
                const maxX = window.innerWidth - this.element.offsetWidth;
                const maxY = window.innerHeight - this.element.offsetHeight;

                // Constrain to viewport
                if (newX < 0) newX = 0;
                if (newY < 0) newY = 0;
                if (newX > maxX) newX = maxX;
                if (newY > maxY) newY = maxY;

                this.element.style.left = `${newX}px`;
                this.element.style.top = `${newY}px`;
                this.element.style.transform = 'none'; // Remove any transform to ensure accurate positioning
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Window controls
        const controls = this.element.querySelector('.title-bar-controls');
        controls.querySelector('[aria-label="Minimize"]').onclick = () => this.minimize();
        controls.querySelector('[aria-label="Close"]').onclick = () => this.close();
        if (this.title !== 'SuperPong' && this.title !== 'ticTacToe') {
            controls.querySelector('[aria-label="Maximize"]').onclick = () => this.maximize();
        }

        // Tab system if content contains tabs
        const tabList = this.element.querySelector('menu[role="tablist"]');
        if (tabList) {
            const tabs = tabList.querySelectorAll('[role="tab"]');
            tabs.forEach(tab => {
                tab.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.switchTab(tab);
                });
            });
        }
    }

    switchTab(selectedTab) {
        const tabs = this.element.querySelectorAll('[role="tab"]');
        const tabContents = this.element.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => tab.setAttribute('aria-selected', 'false'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        selectedTab.setAttribute('aria-selected', 'true');
        const contentId = selectedTab.querySelector('a').getAttribute('href').substring(1);
        const content = this.element.querySelector(`#${contentId}`);
        if (content) content.classList.add('active');
    }

    minimize() {
        this.isMinimized = !this.isMinimized;
        this.element.style.display = this.isMinimized ? 'none' : 'block';
        this.taskbarEntry.classList.toggle('active', !this.isMinimized);
    }

    maximize() {
        if(this.title === 'SuperPong' || this.title === 'ticTacToe') {
            return;
        }
        //console.log('Maximizing window');
        if (!this.isMaximized) {
            this.previousState = {
                width: this.element.style.width,
                height: this.element.style.height,
                left: this.element.style.left,
                top: this.element.style.top,
                transform: this.element.style.transform
            };
            this.isMaximized = true;
            
            const viewportHeight = window.innerHeight - 28;
            this.element.style.width = '100%';
            this.element.style.height = `${viewportHeight}px`;
            this.element.style.left = '0';
            this.element.style.top = '0';
            this.element.style.transform = 'none';
        } else {
            this.isMaximized = false;
            
            Object.assign(this.element.style, this.previousState);
            // Now handleResize will respect the non-maximized state
            this.handleResize();
        }
    }

    close() {
        if (this.title === 'ticTacToe')
        {
            if (window.OnlineGameManager){
                //console.log('Canceling Matchmaking');
                window.OnlineGameManager.cancelMatchmaking();
            }
            //console.log('Cleaning up ticTacToe connections...');
            window.clean_up();
        }
        if (this.title === 'SuperPong') {
			//console.log('Cleaning up game connections...');
            if (window.MatchmakingSystem.isInQueue) {
                //console.log('Canceling Queue');
                window.MatchmakingSystem.cancelQueue();
            }
			if (window.cleanupGameConnections) {
				window.cleanupGameConnections();
				//console.log('Game connections cleaned up successfully');
			} else {
				console.warn('cleanupGameConnections function not found');
			}
            if (window.cleanupTournament) {
                window.cleanupTournament();
                //console.log('Tournament cleaned up successfully');
            } else {
                console.warn('cleanupTournament function not found');
            }
		}
        this.element.remove();
        this.taskbarEntry.remove();
        // Notify DesktopManager to remove this window from its array
        window.desktopManager.removeWindow(this);
    }

    toggleMinimize() {
        this.minimize();
        if (!this.isMinimized) {
            this.element.style.zIndex = ++window.desktopManager.highestZIndex;
        }
    }
}