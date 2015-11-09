# bins n paths
HANDLEBARS := node_modules/.bin/handlebars
SASS       := node_modules/.bin/node-sass
TYPESCRIPT := node_modules/.bin/tsc
UGLIFYJS   := node_modules/.bin/uglifyjs
VULCANIZE  := node_modules/.bin/vulcanize
SRC_PATH   := src
LIB_PATH   := lib

# sources n destination files
SASS_SRC := $(shell find $(SRC_PATH)/*/* -type f \
	          -name "*.scss")
SASS_DST := $(addprefix $(LIB_PATH)/, \
				    $(notdir $(SASS_SRC:.scss=.css)))

HANDLEBARS_SRC := $(shell find $(SRC_PATH)/*/* -type f \
									-name "*.handlebars")
HANDLEBARS_DST := $(addprefix $(LIB_PATH)/, \
									$(notdir $(HANDLEBARS_SRC:.handlebars=.handlebars.js)))

TYPESCRIPT_SRC := $(shell find $(SRC_PATH)/*/* -type f \
									-regex "^.*[^\.d\]\.ts$$")
TYPESCRIPT_DST := $(addprefix $(LIB_PATH)/, \
									$(notdir $(TYPESCRIPT_SRC:.ts=.js)))

OTHER_SRC := $(shell find $(SRC_PATH)/*/* -type f \
						 -name "*.html" -or -name "*.js" -or \
					 	 -name "*.png" -or -name "*.svg" -or \
						 -name "*.json" -or -name "*.ico" -or \
						 -name "*.css" -or -name "*.woff")
OTHER_DST := $(addprefix $(LIB_PATH)/, $(notdir $(OTHER_SRC)))

OUTPUT_FILES := $(SASS_DST) $(HANDLEBARS_DST) $(TYPESCRIPT_DST) $(OTHER_DST)
OUTPUT_HTML := ../f-mentat.html

# options
default: $(OUTPUT_FILES)

release:
	@make clean
	@make
	@make f-mentat.html
	@make f-mentat.min.html

clean:
	@rm -f $(LIB_PATH)/*

help:
	@echo "lol"

# general rules
$(LIB_PATH)/%.handlebars.js: $(SRC_PATH)/*/%.handlebars
	@echo $<
	@$(HANDLEBARS) -f $@ $<

$(LIB_PATH)/%.css: $(SRC_PATH)/*/%.scss
	@echo $<
	@$(SASS) --output-style compressed $< $@

$(LIB_PATH)/%.js: $(SRC_PATH)/*/%.ts
	@echo $<
	@$(TYPESCRIPT) $^ --out $@ -t ES5

$(LIB_PATH)/%.html: $(SRC_PATH)/*/%.html
	@echo $<
	@-cp $< $@

# single rules
$(LIB_PATH)/f-mentat.js: src/f-mentat.ts
	@echo $<
	@$(TYPESCRIPT) $^ --out $@ -t ES5

f-mentat.html: $(OUTPUT_FILES)
	@echo ">>> f-mentat.html"
	@$(VULCANIZE) --output src/f-mentat.html --inline > f-mentat.html

f-mentat.min.html: $(OUTPUT_FILES)
	@echo ">>> f-mentat.min.html"
	@$(VULCANIZE) --strip --output src/f-mentat.html \
								--inline-scripts --inline-css > f-mentat.min.html