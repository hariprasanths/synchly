# Stage 1: Build Python environment
FROM python:latest AS python-build

# Install necessary Python packages
RUN pip install --upgrade pip

# Stage 2: Build Node.js environment
FROM node:latest AS node-build

# Install necessary Node.js packages
RUN npm install -g npm@latest

# Stage 3: Final image
FROM python:latest

# Copy Python environment from python-build stage
COPY --from=python-build /usr/local /usr/local

# Copy Node.js environment from node-build stage
COPY --from=node-build /usr/local /usr/local

ENV USING_DOCKER=true

# install mongodb tools
RUN wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | apt-key add - && echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-5.0.list

# install system dependencies
RUN apt-get update
RUN apt-get install -y libsecret-1-dev \
    pkg-config \
    dos2unix \
    gnome-keyring \
    postgresql-client \
    mongodb-org-tools \
    mariadb-client


WORKDIR /app

COPY . /app

RUN dos2unix -F /app/bin/synchly

RUN npm install

RUN ln -s /app/bin/synchly /usr/local/bin/synchly
RUN cp /app/bin/synchly.conf /etc/ini
RUN mkdir -p ~/.config/systemd/user/ && cp /app/bin/synchly.service  ~/.config/systemd/user/
RUN systemctl --user enable synchly

CMD ["synchly", "--start", "--debug"]